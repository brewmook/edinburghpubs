#!/usr/bin/python

import re
import xml.etree.ElementTree as ET

tree = ET.parse('edinburghpubs.wordpress.2014-12-30.xml')
root = tree.getroot()
channel = root.find('channel')

url_re = re.compile('https://brewmook\.wordpress\.com(.*)')

pubs = {}
for item in channel.findall('item'):
    tags = [x.text for x in item.findall('category') if x.text != 'Edinburgh Castle Tour']
    url = item.find('link').text
    if url:
        url_match = url_re.match(url)
        if url_match and tags:
            pubs[url_match.group(1)] = tags

strings = ['"{0}":["{1}"],'.format(key, '","'.join(pubs[key])) for key in pubs]
strings.sort()

print 'module.exports = {'
for pub in strings:
    print pub
print '};'
