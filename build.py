import re

FILES = [
    "intro.js",
    "util.js",
    "key.js",
    "core.js",
    "outro.js"
]

PATH = 'src/atenea/'

REXP_COMMENT = r'//.*'
REXP_BIG_COMMENT = r'/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/'


def collect_files():

    data = ''
    
    for n in FILES:
        f = open(PATH+n, 'r')
        for line in f.readlines():
            line = line.strip()
            line = re.sub(REXP_COMMENT, '', line)
            data += line
        f.close()

    return data


def build():

    data = collect_files()
    data = re.sub(REXP_BIG_COMMENT, '', data)

    print data

    f = open('atenea.min.js', 'w')
    f.write(data)
    f.close()

if __name__ == '__main__':
    build()
