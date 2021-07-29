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

import { assert, missing } from "../generated/util.mjs";

// Tests for the assert method.

test("test calling the assert method with success", () => {
  const errorMsg = "that's not right!";
  expect(() => {
    assert(1 === 1, errorMsg);
  }).not.toThrow(errorMsg);
});

test("test calling the assert method with an error", () => {
  const errorMsg = "that's not right!";
  expect(() => {
    assert(1 === 2, errorMsg);
  }).toThrow(errorMsg);
});

// tests for the missing method
test("test to see if parameters are missing", () => {
  let unknown = undefined;
  expect(missing(unknown)).toBe(true);

  unknown = null;
  expect(missing(unknown)).toBe(true);

  unknown = "I'm OK";
  expect(missing(unknown)).toBe(false);

  unknown = 0;
  expect(missing(unknown)).toBe(false);

  unknown = [];
  expect(missing(unknown)).toBe(false);
});
