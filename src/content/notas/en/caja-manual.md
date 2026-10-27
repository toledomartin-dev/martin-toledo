---
title: 'I learned to drive stick'
description: 'Born in 1999, I went through almost my whole degree without AI and started working right as it arrived. Why learning the old way matters more than ever, and what I would tell someone starting today.'
date: 2026-10-27
lang: en
key: caja-manual
slug: i-learned-to-drive-stick
tags: ['Career', 'AI', 'Learning']
---

I learned to drive stick. Today almost every new car is automatic and driving is easier, but having learned with a clutch left me something that doesn't go away: I understand what the car does when it shifts, why it stalls on a hill, when a lower gear makes sense. Programming and AI work exactly the same way for me.

## One foot in each world

I was born in 1999. My generation grew up doing many things the way our parents did, and at the same time watched almost everything we now take for granted arrive.

<div class="note-figure">
<div class="note-legend"><span><i class="me"></i>My life</span><span><i></i>Technology</span></div>
<div class="note-timeline">
<div class="me"><b>1999</b><span>I'm born.</span></div>
<div><b>2005</b><span>YouTube launches.</span></div>
<div class="me"><b>2006</b><span>The first computer arrives at home: games and the internet café.</span></div>
<div><b>2008</b><span>Android, the iPhone and Stack Overflow.</span></div>
<div><b>2013</b><span>Docker comes out.</span></div>
<div class="me"><b>2018</b><span>I start Systems Engineering at UTN.</span></div>
<div class="me"><b>2020</b><span>First freelance job: the Córdoba Swimming Federation website.</span></div>
<div class="me"><b>2022</b><span>July: I join my first company.</span></div>
<div><b>2022</b><span>November: ChatGPT comes out.</span></div>
<div class="me"><b>2024</b><span>I graduate as an engineer.</span></div>
<div class="me"><b>2026</b><span>AI writes; I decide what and why.</span></div>
</div>
<p class="note-caption">I went through almost my whole degree without AI: when ChatGPT arrived I was finishing. I joined my first company four months before.</p>
</div>

The first computer arrived in 2006 and it was for games. Then came Gmail, Messenger, Skype, Facebook, Twitter and YouTube. At some point I wanted to mod my phone: I looked for videos explaining how to connect it to the computer and what to change. Without knowing it, that is when I started learning the way I would learn everything else: trying, breaking things and searching again.

## Learning by brute force

When I took my first jobs and joined the company, AI was just appearing and wasn't much use. So I learned the old way: building pages from scratch, searching Stack Overflow and forums, reading entire documentation sites, watching YouTube tutorials. There was no other way.

CSS was a nightmare. Centering a div, absolute positioning, flexbox, z-index, how classes and IDs combine. After enough frustration, I ended up understanding it. The same happened with almost everything else.

I also didn't understand how a website got published. It was all command line: log into the server, start the process with pm2 and hope. Then we moved everything to Docker, and today releasing a version means pushing a tag to GitLab.

<div class="note-figure">
<div class="note-steps" style="--n:4">
<div><b>By hand</b><small>Log into the server and copy files.</small></div>
<div><b>pm2</b><small>The Node process restarts itself if it crashes.</small></div>
<div><b>Docker</b><small>The app and everything it needs, in one image.</small></div>
<div><b>A tag</b><small>GitLab builds, deploys and rolls back if something fails.</small></div>
</div>
<p class="note-caption">How I've published websites, from 2022 to today.</p>
</div>

That stage was slow and frustrating, and it's the one that helps me most today.

## What changed with AI

Today I write far less code by hand: AI writes, and I design, review and fix. I use Claude Code for most of my work: I build a first minimum product and scale it as new requirements come in. I research, add tools, write good prompts and, above all, read what it gives back. If I don't understand something, I ask until I do.

The way we program changed: the job is now deciding what to ask for and reviewing what comes back. Both need the foundation.

An example. I once asked for help routing a service and got a configuration that was correct on paper. But the company had a proxy with its own rules for redirecting sockets, and the AI didn't have that context. I did, because I knew how our infrastructure was set up. Without that, I would have applied something that didn't work without understanding why.

<div class="note-figure">
<div class="note-split">
<div><p>What AI does</p><span>Writes the code.</span><span>Suggests solutions.</span><span>Finds and summarizes documentation.</span><span>Builds a first prototype in minutes.</span></div>
<div><p>What's on you</p><span>Knowing what to ask for.</span><span>Knowing your infrastructure.</span><span>Demanding good practices and security.</span><span>Understanding what it delivered before using it.</span></div>
</div>
</div>

If you don't understand how your system works, AI can give you one that works and that you don't understand. Then you depend on it for everything, including maintaining it.

## The two extremes

Being in the middle, I see both sides.

People starting today write code faster than ever. But if they skip steps, they lack the foundation to notice when something is wrong, and that foundation now has to be built on purpose, because AI doesn't force you to build it.

At the other end are people who programmed one way their whole lives and find it hard to change. When I joined the company I ended up running Git, Docker and Jira training for everyone, and it wasn't easy: every time we had to show why it was better and what was gained. One team merged their code by passing it on a USB drive to a single machine to see what each person had done. And they had good reason to be wary: they had once tried Git without anyone showing them how to use it properly, lost code and were left afraid of it. With some guidance they adopted it, and today they use it and understand why.

That's why I say we got the best of both worlds: we learned on a stick shift and now drive an automatic. And we know the car still needs servicing: on any team, standing still has a cost, with systems tied to old versions, everything that means for security, and tools that stop being supported.

## How I would learn today

First without AI, then with it. It's a tool that's here to stay and you need to know how to use it, but the foundation is built by wrestling with problems.

To someone starting out I would say: don't skip the steps. Jumping straight into AI without the concepts can be overwhelming. It's a process of trial, error and learning, and the picture gets clearer little by little. There used to be many things I didn't understand; today my head is much wider. And I still keep running into new technologies that make me learn all over again.

That's the point: AI changed how code gets written, not the need to understand it.
