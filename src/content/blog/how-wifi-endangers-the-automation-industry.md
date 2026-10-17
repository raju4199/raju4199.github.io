---
title: "How Wi-Fi Puts the Automation Industry in Danger"
description: "Factories run on radios now: wireless HMIs, PLC bridges and sensor meshes. This is the automation blueprint, where Wi-Fi sits in it, and the attacks that turn a parking lot into a foothold on the plant floor."
date: 2026-10-18
tags: [Wi-Fi Security, ICS Security, OT Security, Wireless, Vulnerability Research]
category: Research
cover: ../../assets/blog/wifi-ot-cover.png
coverAlt: "A terminal scanning a plant floor, finding four industrial Wi-Fi networks and zero of them protected, under three Wi-Fi signal arcs"
draft: false
---

A robot arm takes its next move over Wi-Fi. A forklift reports its load over Wi-Fi. An engineer pushes new logic to a controller from a laptop that roamed onto the plant network over Wi-Fi. None of these radios can be seen, fenced, or locked, and every one of them answers to whoever is loudest and closest.

The automation industry spent decades hardening the things it could touch: fences, badge readers, cable runs, air gaps. Then it filled the air with wireless to save on cabling and gain mobility. The result is a factory whose most sensitive machines now listen to the open air, where an attacker in the parking lot is already inside the building's radio range.

This post maps the automation blueprint, shows exactly where Wi-Fi hides in it, and walks through the attacks that turn that convenience into a way in.

<div class="stat-grid not-prose">
  <div class="stat"><span class="stat-value">9.9</span><span class="stat-label">CVSS of flaws in one industrial Wi-Fi access point (Moxa AWK-3131A)</span></div>
  <div class="stat"><span class="stat-value">1997</span><span class="stat-label">year the oldest Wi-Fi design flaws were baked in (FragAttacks)</span></div>
  <div class="stat"><span class="stat-value">~$15k</span><span class="stat-label">estimated cost of the 2022 drone Wi-Fi attack on a finance firm</span></div>
  <div class="stat"><span class="stat-value">20–30 yr</span><span class="stat-label">service life of OT gear that will never get a Wi-Fi patch</span></div>
</div>

> **TL;DR**
>
> - Modern plants run on wireless: HMIs, AGVs, PLC bridges and sensor meshes all speak over the air.
> - Wi-Fi weaknesses live in the **standard itself** (KRACK, FragAttacks), so a strong password does not save you.
> - Industrial APs ship with **hardcoded keys and command-injection bugs**, and the devices behind them rarely get patched.
> - Radio **leaks past the fence**: a long antenna or a cheap drone reaches what guards never see.
> - You can't un-invent wireless, but you **can isolate it, authenticate it, and watch it**.

## The Automation Blueprint: Where Wi-Fi Lives

Industrial networks are usually drawn as the **Purdue model**: neat layers from the business office at the top down to the physical process at the bottom, each one meant to be separated from the next.

Wireless quietly cuts across those layers. Here's the same blueprint, annotated with where Wi-Fi shows up and what it exposes.

![Diagram of the Purdue industrial network model from enterprise IT down to sensors and actuators, with each level annotated by the wireless foothold it exposes: office SSID bridging into OT, Wi-Fi engineering laptops as jump hosts, open HMI tablet networks, plaintext PLC bridges, and jammable sensor meshes](../../assets/blog/wifi-purdue-map.svg)

*The Purdue model assumes the layers are separated. Wi-Fi connects them through the air.*

Walk the stack and the wireless creeps in everywhere:

| Level | Wireless you'll actually find | Why it's exposed |
| --- | --- | --- |
| **L4/5 - Enterprise** | Office and guest Wi-Fi | Shares walls (and sometimes switches) with OT |
| **L3 - Operations** | Engineering laptops, SCADA on Wi-Fi | A roaming laptop is a jump host into control |
| **L2 - Control** | Wireless HMIs, operator tablets | Often open or WPA2-PSK with a shared password |
| **L1 - Controllers** | Wi-Fi/Modbus and Profinet bridges | Industrial protocols have no authentication |
| **L0 - Process** | WirelessHART, Zigbee, 5G sensor modules | Can be jammed or spoofed to blind the controller |

The key point: **industrial protocols were designed to trust the network.** Modbus, Profinet, DNP3 and EtherNet/IP assume that if a message reaches the controller, it is allowed. Wi-Fi hands an attacker that reach without a single cable.

## Why Wireless Is Different (and Worse) in OT

In the office, if Wi-Fi gets owned, someone reads your email. On the plant floor, the stakes are a spinning turbine, a robot arm, a furnace, or a pressure valve. Three things make OT Wi-Fi uniquely dangerous.

### The medium has no perimeter

You can guard a door and cut a cable. You cannot fence radio. Signal leaks through walls into the parking lot, the next tenant's unit, and the airspace above the roof.

![Diagram of a factory with concentric Wi-Fi signal rings: the inner ring is the intended coverage, the middle ring leaks past the perimeter fence, and the outer ring is reachable by an attacker in the parking lot, in a neighbouring unit, or flying a drone over the roof](../../assets/blog/wifi-reach.svg)

*You defended the fence. The radio reaches well past it.*

### The devices never get patched

A Wi-Fi bug in your phone is fixed within weeks. A Wi-Fi bug in a wireless PLC bridge or an HMI tablet certified for a specific production line may **never** be fixed, because patching it means re-testing and re-certifying the line. These are the same [zombie machines](/blog/the-zombie-machines-legacy-systems/) that make legacy such a problem, except now they broadcast.

### The weakness is often in the standard, not your config

The most painful Wi-Fi attacks don't care how long your password is, because the flaw is in the protocol every vendor implemented. KRACK and FragAttacks are exactly this: bugs in Wi-Fi itself.

## The Attacks: From the Parking Lot to the PLC

### KRACK - Breaking WPA2 Without the Password

In 2017, researcher Mathy Vanhoef published **KRACK** (Key Reinstallation Attack). It abuses the WPA2 four-way handshake: by replaying one handshake message, an attacker forces a device to reinstall an already-in-use key, resetting the nonce and making the encryption repeat itself.

![Diagram of the KRACK attack in four steps: sit in radio range and watch the WPA2 handshake, replay message three of the four-way handshake, the client reinstalls the key and reuses the keystream, then the attacker decrypts traffic and injects commands toward HMIs and PLCs](../../assets/blog/wifi-krack-chain.svg)

*A strong Wi-Fi password doesn't help. The weakness is in the handshake, not the password.*

- **CVEs:** CVE-2017-13077 and a family of related IDs
- **Needs:** radio range, no password
- **Result:** decrypt traffic, and on many devices, inject packets

For OT this is severe, because once you can inject packets into an unauthenticated Modbus or Profinet session, you aren't just reading, you're commanding.

### FragAttacks - Flaws Baked In Since 1997

In 2021, Vanhoef followed up with **FragAttacks** (fragmentation and aggregation attacks): a set of design and implementation flaws affecting essentially every Wi-Fi device ever made. Three of them are in the Wi-Fi standard itself and have existed since **1997**, spanning everything from old WEP up through WPA3.

- **CVEs:** CVE-2020-24588 (A-MSDU aggregation) and others
- **Scope:** every Wi-Fi product tested had at least one of the flaws
- **Catch:** hard to exploit, but trivial to find in gear nobody will ever patch

The lesson for OT is blunt: the problem is the devices that will carry these flaws, unpatched, for the next two decades.

### Dragonblood and Kr00k - Even the "Fixed" Versions Leak

WPA3 was supposed to end this. Then came **Dragonblood** (2019, Vanhoef and Eyal Ronen), a set of flaws in WPA3's Dragonfly handshake that allowed downgrade and side-channel attacks. Separately, **Kr00k** (CVE-2019-15126, found by ESET) caused certain Broadcom and Cypress Wi-Fi chips, used in a vast number of devices, to encrypt leftover data with an **all-zero key** after a disconnect, leaking it in the clear.

The pattern repeats: a new standard ships, a new class of bug is found, and the embedded industrial devices are the last to ever receive the fix.

### Evil Twin - The Tablet Trusts the Name, Not the Device

None of the above is even necessary if you can just get the device to connect to you. An **evil twin** is a rogue access point broadcasting the same SSID as the real plant network, with a stronger signal. The operator's tablet sees a familiar name and connects, and now the attacker sits in the middle of every session.

![Diagram of an evil twin attack: an operator tablet looking for the SSID PLANT-OPS, a real access point far away with a weak signal, and an attacker's evil twin access point broadcasting the same SSID with a stronger signal from the parking lot, so the tablet connects to the attacker who then captures logins and alters traffic](../../assets/blog/wifi-evil-twin.svg)

*The loudest radio with the right name takes the session.*

Combine this with **captive portal phishing** for the Wi-Fi password, or with a simple **deauthentication** burst to knock the tablet off the real AP first, and the handoff is reliable. Deauth frames are unauthenticated in networks without Protected Management Frames (PMF), which most older OT networks are.

### WPS, PMKID and Default Passwords - The Unglamorous Way In

Plenty of real breaches need no protocol research at all:

- **WPS PIN:** the eight-digit setup PIN can be brute-forced in hours (Viehböck, 2011). Many industrial APs still ship with it on.
- **PMKID attack:** since 2018, an attacker can grab a hash from a single frame, with no connected client, and crack a weak WPA2 passphrase offline.
- **Shared and default keys:** one WPA2-PSK passphrase printed on a label and reused across the whole site means one leaked sticky note unlocks the air.

### The Access Point Itself Is a Target

The radio hardware that runs your plant Wi-Fi is a computer, and it has its own bugs. Cisco Talos spent years tearing apart the **Moxa AWK-3131A**, a widely deployed industrial access point/bridge/client. The findings, collected in **CISA advisory ICSA-20-063-04** at a CVSS of **9.9**, included:

- **Hardcoded cryptographic keys** (CVE-2019-5137)
- **OS command injection** via a diagnostic script (CVE-2019-5138)
- **Privilege escalation** through a console escape (CVE-2019-5136)
- A dozen more web-interface flaws, including XSS and weak login handling

Earlier Talos work on the same family found a **hidden root account with hardcoded credentials** (CVE-2016-8717, CVSS 10.0) and **unauthenticated command injection** over Telnet (CVE-2017-14459). Moxa shipped fixes, but the open question is always the same: how many deployed units are still on old firmware?

### Drones and War-Driving - Closing the Distance

If the attacker just needs to be in range, they can bring the range to the target. In 2022, security researcher **Greg Linares** described an incident where a US financial firm traced strange activity on its internal Confluence to the **roof**, where it found two drones: a modified **DJI Matrice 600** and a modified **DJI Phantom**, carrying a **Wi-Fi Pineapple**, a Raspberry Pi, and a 4G modem. Linares estimated the whole rig cost no more than **$15,000**.

A drone turns "you need physical proximity" from a defense into a shopping list. For a plant with wireless HMIs on the roofline or near loading docks, the threat model now includes the airspace above it.

## Real Attacks That Actually Happened

The attacks above aren't theory. Here are documented, real-world cases where wireless was the way in, or where automation was controlled over the air by someone who shouldn't have been. Oldest first: what happened, and the lesson.

### Maroochy Shire, Australia (2000): Sewage by Radio

The first widely recognized cyberattack on an industrial control system was wireless. **Vitek Boden** had helped install a radio-controlled SCADA system for the Maroochy Shire sewage network, then was turned down for a job there.

- **Method:** he drove around with **stolen radio equipment and a laptop**, issuing commands to the sewage pumping stations over their own radio link, on dozens of occasions between February and April 2000
- **Impact:** he caused pumps to fail and alarms to be ignored, releasing an estimated **800,000 litres (around a million)** of raw sewage into parks, rivers and a hotel grounds
- **Lesson:** a radio-controlled process trusts whoever can speak its radio protocol. There was no authentication on the commands, so an insider with the right transmitter *was* the control system

### TJX / Marshalls, USA (2005-2007): War-Driving a Parking Lot

Not an industrial plant, but the purest proof that **parking-lot Wi-Fi is a real breach path**. Albert Gonzalez's crew drove around Miami shopping strips looking for weak store wireless.

- **Method:** they found Marshalls stores still using **WEP**, the broken encryption Wi-Fi used before WPA, cracked it from the lot, and pivoted from the store wireless into TJX's central payment network
- **Impact:** around **45 million** card numbers stolen (some estimates far higher); it became, at the time, the largest card breach ever and reshaped **PCI-DSS** wireless rules
- **Lesson:** one weak radio on the edge is a tunnel to the core. The attacker never entered the building, and the same geometry applies to a plant's guest Wi-Fi sitting next to its OT network

### Łódź, Poland (2008): A Tram Set Derailed by Remote

A **14-year-old** turned a city tram system into a toy by attacking its wireless track control.

- **Method:** he modified a **TV remote** into an infrared transmitter and used it to throw trackside **points (switches)** that were controllable over an unauthenticated wireless signal
- **Impact:** **four trams derailed**, several people injured
- **Lesson:** transport is automation too. Any wirelessly actuated switch with no authentication can be driven by anyone who reverse-engineers the signal, and the barrier to entry can be a teenager with a remote

### Jeep Cherokee (2015): The Car's Wi-Fi Password Was the Clock

Charlie Miller and Chris Valasek's famous Jeep hack is best known for the cellular path, but it also had a **Wi-Fi vector** that is a textbook OT lesson.

- **Method:** the Uconnect head unit's Wi-Fi hotspot password was auto-generated from the **time the unit first booted**, not a random value. Because it was seeded before the real clock was set, the realistic keyspace collapsed to a handful of guesses crackable in about an hour
- **Impact:** the hotspot was an entry point to the head unit and then the **CAN bus**; Fiat Chrysler recalled **1.4 million vehicles**
- **Lesson:** a predictable key generator is as good as no key. The automation lesson is identical for any device that ships a factory-derived or time-derived wireless password

### The Finance-Firm Drone (2022): Range Delivered to the Roof

Covered above, but it belongs in any list of real incidents: attackers landed **Wi-Fi-equipped drones on a building's roof** to reach the internal network, and got as far as internal credentials before being caught. It proved that "they'd need to be physically close" is a defense with an expiry date.

### One-Glance Summary

| Incident | Year | Wireless weakness | Impact |
| --- | --- | --- | --- |
| **Maroochy Shire** | 2000 | Unauthenticated radio SCADA | ~800,000 L of sewage released |
| **TJX / Marshalls** | 2005-07 | WEP cracked from the parking lot | ~45M card numbers stolen |
| **Łódź trams** | 2008 | Unauthenticated IR track control | 4 trams derailed, injuries |
| **Jeep Cherokee** | 2015 | Predictable Wi-Fi hotspot password | 1.4M vehicles recalled |
| **Finance-firm drone** | 2022 | Wi-Fi Pineapple flown to the roof | Internal network access |

The thread running through all of them: **the radio was trusted because it was there.** No authentication on the commands, broken or guessable keys, and a perimeter that stopped at the wall while the signal didn't.

## How to Defend Wireless in an Automation Plant

You can't remove wireless from a modern plant, and you often can't patch the devices on it. But you can make the air a far worse place to attack from.

1. **Inventory every radio.** You cannot defend an AP, bridge or wireless sensor you don't know exists. Include rogue-AP detection: that evil twin only works if nobody is watching for duplicate SSIDs.
2. **Treat wireless as untrusted, always.** Terminate Wi-Fi in its own segmented zone and make devices authenticate again (VPN, 802.1X, or an application gateway) before they touch anything in the control layers. Follow **IEC 62443** zones and conduits.
3. **Use WPA3 and enterprise auth where you can.** Per-device credentials via **802.1X / RADIUS** beat a single shared PSK. Turn on **Protected Management Frames** to blunt deauth and evil-twin attacks.
4. **Kill the easy wins.** Disable **WPS**, remove default and shared passwords, and turn off any wireless feature a device doesn't actually use.
5. **Encrypt above the Wi-Fi layer.** Assume the radio can be broken. Tunnel OT protocols through TLS or a VPN so breaking WPA2 still leaves the attacker facing encryption they can't inject into.
6. **Harden the access points themselves.** Patch AP firmware (Moxa, Cisco, Hirschmann), change admin credentials, and disable Telnet and unused management interfaces.
7. **Watch the spectrum.** A wireless IDS can spot rogue APs, deauth floods, and jamming. Sudden loss of a sensor mesh might be interference, or it might be an attack blinding a controller.
8. **Extend the threat model upward.** For high-value sites, roof and airspace monitoring is no longer paranoia. The drone attack already happened.

### Quick Self-Check

How many can you tick for your own plant?

- [ ] I have an inventory of every AP, wireless bridge and wireless sensor, with firmware versions
- [ ] Plant Wi-Fi terminates in its own segment and cannot reach controllers directly
- [ ] WPS is disabled and no device uses a default or site-wide shared password
- [ ] Protected Management Frames (PMF) is enabled on networks that support it
- [ ] OT protocols are encrypted above the Wi-Fi layer, not trusting WPA2 alone
- [ ] Something actively watches for rogue APs and deauth/jamming activity

Fewer than four ticks? The air around your plant is doing more than you think.

### Scan Your Own Wireless (Authorized Networks Only)

Only test networks you own or are authorized to assess.

```bash
# List nearby access points, channels and encryption (Linux, monitor mode)
sudo airmon-ng start wlan0
sudo airodump-ng wlan0mon

# Flag the obvious problems: open networks, WEP, WPS enabled
sudo wash -i wlan0mon            # shows APs with WPS on
```

Look for the red flags this post is about: open SSIDs on the OT range, WEP or WPA(1), WPS enabled, duplicate SSIDs (a possible evil twin), and APs you don't recognize.

```bash
# Check whether an access point's management frames are protected (PMF)
# In the beacon, look for RSN "Management Frame Protection Required/Capable"
sudo tshark -i wlan0mon -Y "wlan.fc.type_subtype == 0x08" -V | grep -i "Management Frame"
```

## Final Thoughts: The Air Is Part of Your Attack Surface

The automation industry wired itself carefully for a century, then started broadcasting. Every wireless HMI, every AGV, every Wi-Fi bridge saves money and adds mobility, and every one of them also radiates a piece of your control network into the parking lot.

The attacks aren't exotic. KRACK and FragAttacks are public. Evil twins and deauth are script-kiddie tier. Industrial APs ship with hardcoded keys. And when proximity is the only barrier left, someone will fly a $15,000 drone onto the roof.

So go walk your plant with a Wi-Fi scanner. Somewhere out there is an SSID you forgot you deployed, on a device that will never be patched, answering to anyone within range. The air carries your control network now. Someone is already listening to it.

## Further Reading

- [KRACK Attacks: Breaking WPA2 (Mathy Vanhoef)](https://www.krackattacks.com/)
- [FragAttacks: fragmentation and aggregation attacks against Wi-Fi](https://www.fragattacks.com/)
- [CISA Advisory ICSA-20-063-04: Moxa AWK-3131A](https://www.cisa.gov/news-events/ics-advisories/icsa-20-063-04)
- [Cisco Talos: vulnerability research on the Moxa AWK-3131A](https://blog.talosintelligence.com/vulnerability-spotlight-moxa-awk-3131a/)
- [The Register: Drones used to hack a financial firm's network (2022)](https://www.theregister.com/2022/10/12/drone-roof-attack/)
- [ESET: Kr00k vulnerability (CVE-2019-15126)](https://www.welivesecurity.com/2020/02/26/krook-serious-vulnerability-affected-encryption-billion-wifi-devices/)
- [RISI: Maroochy Shire sewage spill (2000)](https://www.risidata.com/Database/Detail/maroochy-shire-sewage-spill)
- [Dark Reading: Teenage hacker takes over Polish tram system (2008)](https://www.darkreading.com/perimeter/teenage-hacker-takes-over-polish-tram-system)
- [Kaspersky: The full story of how that Jeep was hacked (2015)](https://www.kaspersky.com/blog/blackhat-jeep-cherokee-hack-explained/)

---

*Running wireless on a plant floor and not sure what's out there, or spotted a mistake in this post? [Reach out](/#contact).*
