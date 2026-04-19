# Cityverse MVP, Project Description

## Core Idea

Cityverse MVP is a virtual city that generates synthetic IoT data.

At its simplest, the idea is this:
- one virtual city,
- a simulated world with time, weather, buildings, people, traffic, and energy systems,
- fake but realistic IoT signals produced by that world,
- an IoT layer that receives and exposes the data,
- a digital twin layer that represents the state of the city and its systems.

The city should function as a living simulation rather than a static model. The goal is not just to render a city, but to create a synthetic urban environment where events, behavior, infrastructure, and telemetry emerge from simulated conditions.

## Main Platform Parts

The platform currently consists of three primary parts:

- **VC (Virtual City)**
  - the simulated urban environment
  - contains buildings, roads, environment, people, weather, time, traffic, and energy systems
  - generates state changes and synthetic IoT data

- **IOT (IoT Broker)**
  - receives and brokers the city’s synthetic telemetry
  - stores data in a database
  - exposes live and historical data for downstream systems

- **Digital Twin (DT)**
  - represents the city and its entities as stateful digital objects
  - links geometry, metadata, live values, and history
  - can be consumed visually through Unity and potentially by other external tools later

## Runtime and Deployment Direction

The current intended runtime model is:
- VC as one executable,
- IOT as one executable,
- DT as one executable.

For now, all three parts should run as separate executables on the same Windows computer.

This separation is important because the system should be architected as cooperating services rather than one monolithic process.

Future direction should also allow optional remote deployment for at least parts of the system. In particular, it should be possible later to run:
- VC remotely or in the cloud,
- IOT remotely or in the cloud,
- DT locally or remotely depending on use case.

This means interfaces between the three parts should be designed as if distribution may happen later, even if the first MVP runs on one machine.

## Overall Purpose

The overall purpose is to create a realistic enough simulation that it can:
- produce believable synthetic IoT data,
- act as a digital twin style environment,
- support analysis and experimentation,
- help test integrations, AI systems, dashboards, and optimization ideas,
- simulate cases that are difficult, expensive, or impossible to test in the physical world.

## Foundational Simulation Systems

The MVP city must include a few foundational systems that drive the rest of the world.

### Time and date
The city must simulate:
- time,
- date,
- progression of time,
- calendar and season relationships.

Time is a root dependency because many other systems depend on it, including occupancy, electricity usage, traffic, solar production, and daylight.

### Day and night cycle
The city must support a day/night cycle that depends on:
- date,
- season,
- time of day.

Daylight should vary realistically across the year so that winter and summer do not behave identically.

### Weather system
The city must include a weather system that is reasonable enough to drive downstream simulation.

At minimum, the weather system should eventually provide values such as:
- temperature,
- wind,
- cloud cover,
- precipitation,
- solar radiation or sunlight intensity,
- seasonal tendencies.

This weather layer should influence:
- daylight and visual atmosphere,
- electricity demand,
- renewable energy generation,
- CO2 emissions,
- possibly traffic and occupancy patterns.

One of the first tasks is to investigate whether there is an existing weather simulator, especially one available on GitHub, that can work together with our simulation rather than building everything from scratch.

## Buildings and City Infrastructure

The city should contain a range of building and infrastructure types, including for example:
- villas,
- apartment buildings,
- office buildings,
- shopping malls,
- datacenter,
- power plants,
- additional public or commercial structures later.

These are not merely geometry. Each entity should carry metadata describing what it is and how it behaves.

Important metadata concepts include:
- building or asset type,
- occupancy type,
- resident, worker, or visitor counts,
- active schedules,
- electricity usage profile,
- floor area,
- efficiency characteristics,
- heating and cooling type,
- battery presence and storage capacity where applicable,
- battery charge and discharge behavior where applicable.

The important point is that city assets should generate behavior, not just occupy space.

## Occupancy and Human Activity

Each building should represent some kind of human presence or activity pattern.

Examples:
- villas have residents who live there,
- offices have workers present during business hours,
- shopping malls have visitor flows that vary by time and date,
- apartment buildings have a different daily rhythm than offices or retail spaces,
- datacenters have low occupancy but high infrastructure intensity.

These patterns should feed into:
- electricity usage,
- occupancy-related telemetry,
- traffic and movement patterns later,
- long-term synthetic dataset realism.

## Electricity, Storage, and Generation

A key requirement is that buildings and infrastructure should have believable electricity behavior across time.

The system should eventually answer questions such as:
- how much electricity does this building or asset use,
- how does usage change during the day,
- how does it vary by season,
- how do occupancy and weather affect demand,
- how much power is imported from the grid,
- how much energy is stored in or drawn from local batteries where applicable.

All houses and other major building types should have realistic kWh usage models so the platform can be used to monitor electrical systems meaningfully.

This should include support for:
- current power demand,
- accumulated energy usage over time,
- building-level kWh profiles,
- battery charge level,
- battery charging and discharging,
- local energy consumption vs stored energy usage where applicable.

The city should also include electricity generation sources such as:
- wind farm,
- solar farm,
- mini nuclear plant,
- gas or oil plant.

Important requirements:
- wind generation must depend on wind,
- solar generation must depend on daylight and weather,
- dispatchable plants such as gas, oil, or nuclear should have more stable output patterns but still respect operational logic.

This generation system should eventually allow simulation of:
- total city production,
- mismatch between generation and demand,
- dependency on weather,
- synthetic grid and power telemetry.

Research into realistic consumption and generation statistics has been added as an explicit task.

## IoT Data Flow and Real-World Fidelity

A major investigation area is how IoT data and related information should move through the system in a way that resembles the real world as closely as practical.

This includes understanding:
- how sensors or simulated devices publish data,
- how data is transmitted to IOT,
- how that data is stored and normalized,
- how downstream systems consume it,
- how Unity and the visual DT should subscribe to or query that data.

This is one of the central architectural questions in the project.

The intended overall flow is:
1. a simulated sensor or city subsystem in VC emits telemetry,
2. the telemetry is transmitted using a realistic pattern or protocol,
3. IOT ingests, normalizes, and stores the data,
4. DT consumes live and historical state,
5. Unity and related visual layers reflect the updated world.

The closer this flow resembles real-world IoT architecture, the more useful the platform becomes for testing, training, integration design, and digital twin experimentation.

## Synthetic IoT Data Generation

The heart of the project is the generation of fake but meaningful IoT data.

Examples of simulated telemetry may include:
- building electricity consumption,
- occupancy signals,
- temperature and humidity,
- weather station data,
- energy generation metrics,
- traffic-related data,
- system status values,
- derived city-level metrics,
- CO2 emissions data for buildings, traffic, power generation, and city-wide totals.

The data should not be random noise. It should emerge from the simulation state so that values are connected to causes in the world.

That gives the platform more value because:
- anomalies can be simulated intentionally,
- causal relationships can be studied,
- synthetic datasets become more useful for AI training and testing,
- dashboards and integrations can behave as if they are connected to a real urban system.

## Control UI

VC should have a user interface, initially as a webpage, that allows direct control over key simulation systems.

The first version of the UI should expose controls for:
- time,
- date,
- weather,
- power plant on/off state,
- likely simulation play, pause, and speed controls later.

This UI should act as the operator surface for the simulation. It is where a user can deliberately change conditions and observe how the city responds.

Minimum useful outputs in the UI should include:
- current weather state,
- current power generation state,
- current electricity usage,
- city-wide CO2 emissions,
- category or district-level CO2 breakdown where possible.

## CO2 Emissions Modeling

The city should track CO2 emissions in real time across both the whole city and individual parts of the city.

This means emissions should be represented at multiple levels, such as:
- city-wide total emissions,
- district-level emissions,
- building-level emissions,
- traffic-related emissions,
- power-generation emissions.

The emissions model should react to simulation state. Examples include:
- colder weather causing increased heating demand,
- an oil or gas plant starting up and increasing CO2 output,
- higher building electricity usage contributing to emissions,
- traffic activity increasing transportation emissions,
- changes in cleaner vs dirtier energy generation affecting the city-wide CO2 profile.

The important principle is that CO2 values must be causally linked to what is happening in the city, not merely displayed as decorative numbers.

## Additional Systems to Plan For

Several additional systems are natural extensions of the concept and should be accounted for early in the architecture, even if not all of them land in the first MVP.

Examples include:
- power grid structure,
- heating systems,
- water and utility systems,
- EV charging,
- street lighting,
- public-service buildings,
- telecom infrastructure,
- event and anomaly handling,
- sensor taxonomy.

## MVP Intent

The MVP should stay focused on proving the core loop:
1. simulate a virtual city,
2. generate believable synthetic IoT data from that city,
3. broker the data through IOT,
4. represent the result in DT,
5. make it inspectable and useful in the UI and external tools.

## Related Documents

- `docs/IOT_BROKER.md`
- `docs/BUILDING_METADATA_MODEL.md`
- `docs/TASKS.md`
