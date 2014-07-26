module.exports = function (code) {
    var result = [];
    var currentLine = 0;
    var labels = {};
    for (var i = 0; i < code.length; i++) {
        var line = code[i];
        if (line[line.length - 1] === ':') {
            var label = line.slice(2, -1);
            labels[label] = currentLine;
            line = '; ' + label + ':';
        } else {
            line = '    ' + line;
            currentLine++;
        }
        result.push(line);
    }

    var cl = 0;
    for (var i = 0; i < result.length; i++) {
        for (var label in labels) {
            result[i] = result[i].replace('__' + label, labels[label]);
            result[i] = result[i].replace('__(line + 2)', cl + 2);
        }
        if (result[i][0] !== ';') {
            cl++;
        }
    }

    return result;
};
