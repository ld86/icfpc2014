# simple bot + map access utils
# warning: tuples are reversed
# compileme: ./py-translator/translator.py simplebot.py

def map_width(m):
    result = 1
    if _is_int(m) == 0:
        mm, element = m
        result += map_width(mm)
    return result

def map_height((mm, element)):
    return map_width(element)

def map_element(m, x):
    mm, element = m
    if x != 0:
        element = map_element(mm, x - 1)
    return element

def myfunc(ai_state, world_state):
    b, h, w, p_seed, p_y, p_x = ai_state
    fruit, ghosts, lambda_man, world_map = world_state
    l_score, l_lives, l_move, l_location, l_vitality = lambda_man
    l_y, l_x = l_location

    if p_x == l_x and p_y == l_y:
        l_move = p_seed - (p_seed / 4) * 4
        p_seed *= 1103515245;
        p_seed += 12345;
        p_seed -= (p_seed / 1299709) * 1299709

    w = map_width(world_map)
    h = map_height(world_map)

    row = map_element(world_map, 5)
    element = map_element(row, 4)
    return (l_x, l_y, p_seed, w, h, element), l_move

def callback(ai_state, world_state): # essential because of limited frame size
    return myfunc(ai_state, world_state)

def init():
    return 0, 0, 31337, 0, 0, 0#, width, height

def result():
    b = callback 
    return init(), b
