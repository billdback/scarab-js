"use strict";

/*
 * Scarab.js (c) 2021, William D. Back.  All rights reserved.
 * This software is released under the ISC license.
 *
 * Scarab.js is a framework for quickly and easily creating entity-based, discrete event simulations.  The focus is on
 * speed and ease of creating and running simulations, with performance being second.
 *
 * Any properties beginning with an underscore (_) are assumed to be private and should not be directly modified.
 * Changes may cause unwanted side-effects.
 *
 * This file tests events.
 */

import {EntityDescription} from "../generated/entities.mjs";
import {Event, SIMULATION_TIME_ADVANCE_EVENT, SimulationTimeAdvance} from "../generated/events.mjs";

test("create a base entity description", () => {
    const ed = new EntityDescription("entity");
    expect(ed.name).toBe("entity");
    expect(ed.guid).toBeTruthy();
});

test("create an entity description with default properties", () => {
    const ed = new EntityDescription("entity", {prop1: 1, prop2: "two"});
    expect(ed.name).toBe("entity");
    expect(ed.guid).toBeTruthy();
    expect(ed.prop1).toBe(1);
    expect(ed.prop2).toBe("two");

    const ent = ed.entity();
    expect(ent.name).toBe("entity");
    expect(ent.guid).toBeTruthy();
    expect(ent.prop1).toBe(1);
    expect(ent.prop2).toBe("two");
});

test("create an entity description with default properties", () => {
    const ed = new EntityDescription("entity", {prop1: 1, prop2: "two"});
    const ent = ed.entity({prop1: 1.1, prop3: "xxx"});
    expect(ent.name).toBe("entity");
    expect(ent.guid).toBeTruthy();
    expect(ent.prop1).toBe(1.1);
    expect(ent.prop2).toBe("two");
    expect(ent.prop3).toBe("xxx");
});

test("test setting property values directly", () => {
    const ed = new EntityDescription("entity", {prop1: 1, prop2: "two"});
    const ent = ed.entity();
    expect(ent.prop1).toBe(1);
    expect(ent.prop2).toBe("two");

    ent.prop1 = 1.1;
    expect(ent.prop1).toBe(1.1);

    expect(ent.prop3).toBeUndefined();
    ent.prop3 = 3;
    expect(ent.prop3).toBe(3);
});

test("create a entity that handles an event", () => {
    const ed = new EntityDescription("entity");
    let results = 0;
    ed.onEvent("event", function (event) {
        results = 1;
    });
    expect(results).toBe(0);

    const entity = ed.entity();
    const event = new Event("event");
    entity.handleEvent(event);
    expect(results).toBe(1);
});

test("test handling events with properties and handlers", () => {

    const ed = new EntityDescription("entity", {prop: 1});
    ed.onEvent("event", function (event) {
        this.prop = event.prop;
    });

    const ent1 = ed.entity();
    const ent2 = ed.entity();

    expect(ent1.prop).toBe(1);
    expect(ent2.prop).toBe(1);

    const event = new Event("event", {prop: 3});
    ent1.handleEvent(event);

    expect(ent1.prop).toBe(3);
    expect(ent2.prop).toBe(1);

    const event2 = new Event("event2", {prop: 6});
    ent1.handleEvent(event2);
    expect(ent1.prop).toBe(3);
    expect(ent2.prop).toBe(1);
});

test("create a entity that handles a time update event", () => {
    const ed = new EntityDescription("entity", {time: 0});
    let results = 0;
    ed.onEvent(SIMULATION_TIME_ADVANCE_EVENT, function (timeUpdateEvent) {
        this.time = timeUpdateEvent.time;
    });

    const ent = ed.entity();
    expect(ent.time).toBe(0);

    ent.handleEvent(new SimulationTimeAdvance().at(1));
    expect(ent.time).toBe(1);

    ent.handleEvent(new SimulationTimeAdvance().at(5));
    expect(ent.time).toBe(5);
});

test("test handling entity created events", () => {

    const ed = new EntityDescription("entity", {other_entity: null});
    ed.onEntityCreated("other_entity", function (entity) {
        this.other_entity = entity.name;
    });

    const ent1 = ed.entity();
    const ent2 = ed.entity();

    expect(ent1.other_entity).toBeNull();
    expect(ent2.other_entity).toBeNull();

    const oed = new EntityDescription("other_entity");
    const ued = new EntityDescription("unknown_entity");

    ent1.handleEntityCreated(oed);
    expect(ent1.other_entity).toBe("other_entity");
    expect(ent2.other_entity).toBeNull();

    ent1.handleEntityCreated(ued);
    expect(ent1.other_entity).toBe("other_entity");
    expect(ent2.other_entity).toBeNull();

    ent2.handleEntityCreated(ued);
    expect(ent1.other_entity).toBe("other_entity");
    expect(ent2.other_entity).toBeNull();

    ent2.handleEntityCreated(oed);
    expect(ent1.other_entity).toBe("other_entity");
    expect(ent2.other_entity).toBe("other_entity");
});

test("test handling entity destroyed events", () => {

    const ed = new EntityDescription("entity", {other_entity: null});
    ed.onEntityCreated("other_entity", function (entity) {
        this.other_entity = entity.name;
    });
    ed.onEntityDestroyed("other_entity", function (entity) {
        this.other_entity = null;
    })

    const ent1 = ed.entity();
    expect(ent1.other_entity).toBeNull();

    const oed = new EntityDescription("other_entity");
    const ued = new EntityDescription("unknown_entity");

    ent1.handleEntityCreated(oed);
    expect(ent1.other_entity).toBe("other_entity");

    ent1.handleEntityDestroyed(oed);
    expect(ent1.other_entity).toBeNull();

    ent1.handleEntityCreated(ued);
    expect(ent1.other_entity).toBeNull();

    ent1.handleEntityDestroyed(ued);
    expect(ent1.other_entity).toBeNull();
});

test("test handling entity updated events", () => {

    const ed = new EntityDescription("entity", {other_entity: null, updated: false});
    ed.onEntityCreated("other_entity", function (entity) {
        this.other_entity = entity.name;
    });
    ed.onEntityDestroyed("other_entity", function (entity) {
        this.other_entity = null;
        this.updated = false;
    });
    ed.onEntityUpdated("other_entity", function (entity, updatedProps) {
        this.updated = true;
    });

    const ent1 = ed.entity();
    expect(ent1.other_entity).toBeNull();
    expect(ent1.updated).toBeFalsy();

    const oed = new EntityDescription("other_entity");

    ent1.handleEntityCreated(oed);
    expect(ent1.other_entity).toBe("other_entity");
    expect(ent1.updated).toBeFalsy();

    ent1.handleEntityUpdated(oed, ["prop1"]);
    expect(ent1.other_entity).toBe("other_entity");
    expect(ent1.updated).toBeTruthy();

    ent1.handleEntityDestroyed(oed);
    expect(ent1.other_entity).toBeNull();
    expect(ent1.updated).toBeFalsy();
});
