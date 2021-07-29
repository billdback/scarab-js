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

import {
    Event,
    SIMULATION_TIME_ADVANCE_EVENT, ENTITY_CREATED_EVENT, ENTITY_UPDATED_EVENT, ENTITY_DESTROYED_EVENT,
    SimulationTimeAdvance, EntityCreatedEvent, EntityDestroyedEvent, EntityUpdatedEvent
} from "../generated/events.mjs";

// Test base event ===================================================================================================

test("create a generic event", () => {
    const evt = new Event("my.event");
    expect(evt.name).toBe("my.event");
    expect(evt.guid).toBeTruthy();
    expect(evt.time).toBeUndefined();
});

test("create event with time", () => {
    const evt = new Event("my.event").at(12);
    expect(evt.name).toBe("my.event");
    expect(evt.guid).toBeTruthy();
    expect(evt.time).toBe(12);
});

test("create event from object", () => {
    const evt = Event.eventFromObject({ name: "my.event", "time": 12, otherprop: "xyz" });
    expect(evt.name).toBe("my.event");
    expect(evt.time).toBe(12);
    expect(evt.otherprop).toBe("xyz");
});

test("create event from bad object", () => {
    expect(() => { Event.eventFromObject({"prop": "value"})}).toThrow(Error);
});

// Test specific events ==============================================================================================

test("simulation time advance event", () => {
    const evt = new SimulationTimeAdvance().at(2);
    expect(evt.name).toBe(SIMULATION_TIME_ADVANCE_EVENT);
    expect(evt.guid).toBeTruthy();
    expect(evt.time).toBe(2);
});

test("entity created event", () => {
    const evt = new EntityCreatedEvent("entity.foo", { "guid": "abc", "prop1": 123});
    expect(evt.name).toBe(ENTITY_CREATED_EVENT);
    expect(evt.guid).toBeTruthy();
    expect(evt.entityRef.guid).toBe("abc");
    expect(evt.entityRef.prop1).toBe(123);
});

test("entity destroyed event", () => {
    const evt = new EntityDestroyedEvent("entity.foo", "abc");
    expect(evt.name).toBe(ENTITY_DESTROYED_EVENT);
    expect(evt.guid).toBeTruthy();
    expect(evt.entityName).toBe("entity.foo");
    expect(evt.entityGUID).toBe("abc");
});

test("entity updated event", () => {
    const evt = new EntityUpdatedEvent("entity.foo", { "guid": "abc", "prop1": 123});
    expect(evt.name).toBe(ENTITY_UPDATED_EVENT);
    expect(evt.guid).toBeTruthy();
    expect(evt.entityRef.guid).toBe("abc");
    expect(evt.entityRef.prop1).toBe(123);
});
