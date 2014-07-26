#!/usr/bin/env python

import sys
import imp
import dis
import opcode

def disassemble(co):
    result = []
    """Disassemble a code object."""
    code = co.co_code
    labels = dis.findlabels(code)
    linestarts = dict(dis.findlinestarts(co))
    n = len(code)
    i = 0
    extended_arg = 0
    free = None
    while i < n:
        is_linestart = (i in linestarts)
        is_label = (i in labels)

        c = code[i]
        op = ord(c)
        i = i+1
        if op >= opcode.HAVE_ARGUMENT:
            oparg = ord(code[i]) + ord(code[i+1])*256 + extended_arg
            extended_arg = 0
            i = i+2
            if op == opcode.EXTENDED_ARG:
                extended_arg = oparg*65536L
            optype = None
            opval = None
            if op in opcode.hasconst:
                optype = 1
                opval = co.co_consts[oparg]
            elif op in opcode.hasname:
                optype = 2
                opval = co.co_names[oparg]
            elif op in opcode.hasjrel:
                optype = 3
                opval = i + oparg
            elif op in opcode.haslocal:
                optype = 4
                opval = co.co_varnames[oparg]
            elif op in opcode.hascompare:
                optype = 5
                opval = opcode.cmp_op[oparg]
            elif op in opcode.hasfree:
                if free is None:
                    free = co.co_cellvars + co.co_freevars
                optype = 6
                opval = free[oparg]
        else:
            oparg = None
        result.append((is_linestart, is_label, i, opcode.opname[op], oparg, optype, opval))
    return result

def trans(module, co, vals, offset):
    bag = {}
    bag["indent"] = 0
    bag["last_st"] = offset + co.co_argcount - 1
    bag["funcs"] = []

    def compare(x):
        r = []
        if x[4] == 2:
            r.append(("CEQ",))
            bag["inv"] = False
        if x[4] == 3:
            r.append(("CEQ",))
            bag["inv"] = True
        if x[4] == 4:
            r.append(("CGT",))
            bag["inv"] = False
        if x[4] == 0:
            r.append(("CGT",))
            bag["inv"] = True
        if x[4] == 5:
            r.append(("CGTE",))
            bag["inv"] = False
        if x[4] == 1:
            r.append(("CGTE",))
            bag["inv"] = True
        return r

    def lll(x):
        return "label_" + str(x)

    def make_labels(x):
        if (lll(x[2])) in bag:
            return lll(x[2])

    def jump(x, inv):
        bag[lll(x[4])] = True
        bag[lll(x[2])] = True
        if not bag["indent"]:
            v = "RTN"
        else:
            v = "JOIN"
        bag["indent"] += 1
        inv = (bag["inv"] != inv)
        del bag["inv"]
#        if bag["inv"]:
#            del bag["inv"]
        if inv:
            return [("SEL", lll(x[4]), lll(x[2])), (v,)]
        else:
#            del bag["inv"]
            return [("SEL", lll(x[2]), lll(x[4])), (v,)]

    def ret(x):
        if bag["indent"]:
            bag["indent"] = 0
            return [("JOIN",)]
        else:
            return [("RTN",)]

    def unpack_sequence(x):
        r = []
        stp = bag["last_st"] + 1

        for i in xrange(x[4] - 1):
            r.append(("ST", 0, stp))
            r.append(("LD", 0, stp))
            r.append(("CAR",)) # CDR?
            r.append(("LD", 0, stp))
            r.append(("CDR",)) # CDR?
        return r

    def st(x):
        r = []
        bag["last_st"] = offset + x[4]
        if "func" in bag:
            r.append(("LDF", bag["func"]))
            bag["funcs"].append((bag["func"], 0))
            del bag["func"]
        r.append(("ST",0, offset + x[4]))
        return r

    def load_global(x):
        bag["func"] = x[6]
        return []

    def call_function(x):
        r = []
        f = bag["func"] if "func" in bag else None
        if "func" in bag: del bag["func"]

        if f == "_is_int":
            r.append(("ATOM",))
            return r

        if f:
            inner = module.__dict__[f].__code__
            n = max(x[4], inner.co_argcount + inner.co_nlocals + 1)
            d = n - x[4]
            for i in xrange(d):
                r.append(("LD", 0, 0))
            r.append(("LDF", f))
            bag["funcs"].append((f, 0))

            r.append(("AP", n))
        return r

    def load_const(x):
        r = []
        if isinstance(x[6], tuple):
            for v in x[6]:
                r.append(("LDC", v))
            for i in xrange(len(x[6]) - 1):
                r.append(("CONS",))
        else:
            r.append(("LDC", x[6]))
        return r

    def jump_forward(x):
        if x[4] != 0:
            raise Exception("simple jump is too hard to implement sry")
        return []

    table = {
            "LOAD_CONST": load_const, #lambda x: [("LDC", x[6])],
            "BINARY_ADD": lambda x: [("ADD",)],
            "BINARY_SUBTRACT": lambda x: [("SUB",)],
            "BINARY_MULTIPLY": lambda x: [("MUL",)],
            "BINARY_DIVIDE": lambda x: [("DIV",)],
            "INPLACE_ADD": lambda x: [("ADD",)],
            "INPLACE_SUBTRACT": lambda x: [("SUB",)],
            "INPLACE_MULTIPLY": lambda x: [("MUL",)],
            "INPLACE_DIVIDE": lambda x: [("DIV",)],
            "COMPARE_OP": compare,
            "POP_JUMP_IF_FALSE": lambda x: jump(x, False),
            "POP_JUMP_IF_TRUE": lambda x: jump(x, True),
            "JUMP_FORWARD": jump_forward, #we shouldn't use "else", command:JOIN
            "JUMP_ABSOLUTE": lambda x: [], #we shouldn't use "else", command:JOIN
            "LOAD_FAST": lambda x: [("LD",0, offset + x[4])],
            "STORE_FAST": st, #lambda x: [("ST",0,x[4])],
            "RETURN_VALUE": ret,
            "BUILD_TUPLE": lambda x: [("CONS",) for i in xrange(x[4] - 1)],
            "UNPACK_SEQUENCE": unpack_sequence,
            "CALL_FUNCTION": call_function,
            "LOAD_GLOBAL": load_global,
    }

    for val in vals:
        if val[3] in table:
            line = "\n".join(" ".join(map(str, x)) for x in table[val[3]](val)) + " ; " + repr(val)
            ls = make_labels(val)

            print line
            if ls: print ls + ":"
        else:
            print "<unknown> (" + repr(val) + ")"

    return bag["funcs"]

module = imp.load_source("src", sys.argv[1])

fs = [("result", 0)]

done = set()

while fs:
    r, o = fs[0]
    del fs[0]
    if r in done: continue
    done.add(r)
    co = module.__dict__[r].__code__
    res = disassemble(co)
    print
    print "%s: ; func" % r
    fs += trans(module, co, res, o)

