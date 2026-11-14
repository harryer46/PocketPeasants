#!/usr/bin/env python3
"""Assemble src/ modules into ../monsterwelt.html (single-file game). Run: python3 src/build.py"""
import re,os,sys
D=os.path.dirname(os.path.abspath(__file__))
def inc(t):
    return re.sub(r'^(?:/\*@inc (\S+)\*/|//@inc (\S+))$',lambda m:inc(open(os.path.join(D,m.group(1) or m.group(2))).read()[:-1]),t,flags=re.M)
s=inc(open(os.path.join(D,'index.html')).read())
# fonts.css is joined back onto the <style> line
s=s.replace('<style>\n/*FONTS*/','<style>')
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(D,'..','monsterwelt.html')
open(out,'w').write(s);print('built',out,len(s))
