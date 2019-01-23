/**
 * @file Rotate.js
 * Contains the Rotate class
 */

const { Gesture, Point2D } = require('westures-core');

const REQUIRED_INPUTS = 2;

/**
 * A Rotate is defined as two inputs moving with a changing angle between them.
 *
 * @class Rotate
 */
class Rotate extends Gesture {
  /**
   * Constructor function for the Rotate class.
   */
  constructor() {
    super('rotate');
  }

  /**
   * Store individual angle progress on each input, return average angle change.
   */
  getAngle(active) {
    let angle = 0;
    for (let i = 1; i < active.length; ++i) {
      const progress = active[i].getProgressOfGesture(this.id);
      const currentAngle = active[0].currentAngleTo(active[i]);
      angle += angularMinus(currentAngle, progress.previousAngle);
      progress.previousAngle = currentAngle;
    }
    angle /= (active.length - 1);
    return angle;
  }

  /**
   * Initialize the progress of the gesture.
   *
   * @param {State} input status object
   */
  initializeProgress(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length < REQUIRED_INPUTS) return null;
    this.getAngle(active);
  }

  /**
   * Event hook for the start of a gesture.
   *
   * @param {State} input status object
   *
   * @return {null}
   */
  start(state) {
    this.initializeProgress(state);
  }

  /**
   * Event hook for the move of a Rotate gesture.
   *
   * @param {State} input status object
   *
   * @return {null} - null if this event did not occur
   * @return {Object} obj.angle - The current angle along the unit circle
   * @return {Object} obj.pivot - The pivot point of the rotation
   * @return {Object} obj.delta - The change in angle since the last emitted
   *                              move.
   */
  move(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length < REQUIRED_INPUTS) return null;

    const pivot = Point2D.midpoint(active.map( i => i.current.point ));
    const delta = this.getAngle(active);

    return {
      pivot,
      delta,
    };
  }
  /* move*/

  /**
   * Event hook for the end of a gesture.
   *
   * @param {State} input status object
   *
   * @return {null}
   */
  end(state) {
    this.initializeProgress(state);
  }
}

/**
 * Helper function to regulate angular differences, so they don't jump from 0 to
 * 2*PI or vice versa.
 */
const PI2 = 2 * Math.PI;
function angularMinus(a, b = 0) {
  let diff = a - b;
  if (diff < -Math.PI) {
    diff += PI2;
  } else if (diff > Math.PI) {
    diff -= PI2;
  }
  return diff;
}

module.exports = Rotate;

