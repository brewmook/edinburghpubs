#!/usr/bin/python

import re
import xml.etree.ElementTree as ET

tree = ET.parse('edinburghpubs.wordpress.2014-12-30.xml')
root = tree.getroot()
channel = root.find('channel')

title_re = re.compile('#[0-9]+: (.*)')

pubs = {}
for item in channel.findall('item'):
    tags = [x.text for x in item.findall('category') if x.text != 'Edinburgh Castle Tour']
    title_text = item.find('title').text
    if title_text:
        title_match = title_re.match(title_text)
        if title_match and tags:
            pubs[title_match.group(1)] = tags

strings = ['"{0}":["{1}"],'.format(key, '","'.join(pubs[key])) for key in pubs]
strings.sort()

print '{'
for pub in strings:
    print pub
print '}'
