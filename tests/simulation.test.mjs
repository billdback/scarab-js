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
 * This file tests the util classes and functions.
 */

import { EntitySimulation } from "../generated/simulation";
import { EntityDescription } from "../generated/entities";

// Tests of the event handler lists.

test("Test handling events", () => {
    Even
}) ;

// Tests of the simulation.

test("test creating a new, empty sim", () => {
    let sim = new EntitySimulation();
    expect(sim.name).toBe("unknown-simulation");
    expect(sim.timeStepped).toBeTruthy();
    expect(sim.numberEntities()).toBe(0);

    sim = new EntitySimulation("test-sim", false);
    expect(sim.name).toBe("test-sim");
    expect(sim.timeStepped).toBeFalsy();
    expect(sim.numberEntities()).toBe(0);
});

test("test adding and removing entities and getting the length", () => {
    const sim = new EntitySimulation();
    expect(sim.numberEntities()).toBe(0);

    const ed = new EntityDescription("test-entity");

    const ent1 = ed.entity();
    const ent2 = ed.entity();
    const ent3 = ed.entity();

    sim.addEntity(ent1);
    sim.addEntity(ent2);
    expect(sim.numberEntities()).toBe(2);

    sim.destroyEntity(ent2.guid);
    expect(sim.numberEntities()).toBe(1);

    sim.addEntity(ent3);
    expect(sim.numberEntities()).toBe(2);

    sim.destroyEntity(ent1.guid); // delete with string.
    sim.destroyEntity(ent3);      // delete with entity
    expect(sim.numberEntities()).toBe(0);
});

test("test removing an unknown entity", () => {
    const sim = new EntitySimulation();
    sim.destroyEntity("unknown");
});

