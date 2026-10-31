import { PhysicsSimulationModel } from '@conceptlens/shared';

export const samplePhysicsModels: Record<string, PhysicsSimulationModel> = {
  ray_optics: {
    domain: 'physics',
    type: 'ray_optics',
    title: 'Geometrical Optics: Convex Lens Ray Diagram',
    topic: 'Optics & Refraction of Light',
    description:
      'Interactive ray tracing demonstrating real & virtual image formation through a biconvex lens with principal rays, object distance (u), and focal length (f).',
    originalImageUrl:
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    parameters: {
      focalLength: 100,
      objectDistance: 220,
      objectHeight: 60
    },
    interactiveControls: [
      { id: 'objectDistance', label: 'Object Distance (u)', min: 40, max: 400, step: 5, unit: 'mm', defaultValue: 220 },
      { id: 'focalLength', label: 'Focal Length (f)', min: 60, max: 180, step: 5, unit: 'mm', defaultValue: 100 },
      { id: 'objectHeight', label: 'Object Height (ho)', min: 20, max: 90, step: 2, unit: 'mm', defaultValue: 60 }
    ],
    formulas: [
      {
        label: 'Gaussian Thin Lens Formula',
        formula: '1/f = 1/v - 1/u',
        explanation: 'Relates focal length (f) to object distance (u) and image distance (v) using Cartesian sign convention.'
      },
      {
        label: 'Linear Magnification',
        formula: 'm = v / u = hi / ho',
        explanation: 'Ratio of image height to object height. Negative magnification indicates an inverted real image.'
      },
      {
        label: 'Optical Power',
        formula: 'P = 1 / f (in meters) [Dioptres]',
        explanation: 'Refractive capability of the lens; positive for converging, negative for diverging.'
      }
    ]
  },

  pendulum: {
    domain: 'physics',
    type: 'pendulum',
    title: 'Simple Pendulum: Simple Harmonic Motion (SHM)',
    topic: 'Oscillations & Classical Mechanics',
    description:
      'Interactive simulation of an oscillating pendulum bob demonstrating gravitational restoring force, period, and real-time kinetic vs potential energy conservation.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    parameters: {
      length: 1.5,
      angle: 25,
      gravity: 9.8,
      mass: 0.5
    },
    interactiveControls: [
      { id: 'length', label: 'String Length (L)', min: 0.5, max: 3.0, step: 0.1, unit: 'm', defaultValue: 1.5 },
      { id: 'angle', label: 'Release Amplitude (θ)', min: 5, max: 55, step: 1, unit: '°', defaultValue: 25 },
      { id: 'gravity', label: 'Gravitational Accel (g)', min: 1.6, max: 24.8, step: 0.2, unit: 'm/s²', defaultValue: 9.8 },
      { id: 'mass', label: 'Bob Mass (m)', min: 0.1, max: 2.0, step: 0.1, unit: 'kg', defaultValue: 0.5 }
    ],
    formulas: [
      {
        label: 'Time Period of Oscillation',
        formula: 'T = 2π √(L / g)',
        explanation: 'For small amplitudes (sin θ ≈ θ), period depends strictly on string length and gravitational acceleration.'
      },
      {
        label: 'Restoring Force',
        formula: 'F_restoring = -m · g · sin(θ)',
        explanation: 'Component of gravity tangent to the circular path pulling the bob back toward equilibrium.'
      },
      {
        label: 'Mechanical Energy Conservation',
        formula: 'E_total = K + U = 1/2 m v² + m g h = constant',
        explanation: 'Total energy continuously converts between maximum kinetic energy at bottom and maximum potential energy at apex.'
      }
    ]
  },

  projectile: {
    domain: 'physics',
    type: 'projectile',
    title: '2D Kinematics: Projectile Trajectory & Range',
    topic: 'Kinematics & Motion in a Plane',
    description:
      'Interactive projectile launcher showing parabolic flight path, velocity component decomposition, maximum altitude, and flight duration.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    parameters: {
      velocity: 32,
      angle: 45,
      gravity: 9.8
    },
    interactiveControls: [
      { id: 'velocity', label: 'Initial Velocity (v₀)', min: 10, max: 60, step: 1, unit: 'm/s', defaultValue: 32 },
      { id: 'angle', label: 'Launch Angle (θ)', min: 15, max: 80, step: 1, unit: '°', defaultValue: 45 },
      { id: 'gravity', label: 'Gravity (g)', min: 1.6, max: 20.0, step: 0.2, unit: 'm/s²', defaultValue: 9.8 }
    ],
    formulas: [
      {
        label: 'Parabolic Trajectory Equation',
        formula: 'y(x) = x · tan(θ) - (g · x²) / (2 · v₀² · cos²(θ))',
        explanation: 'Expresses vertical position as a quadratic function of horizontal distance traveled.'
      },
      {
        label: 'Horizontal Range',
        formula: 'R = (v₀² · sin(2θ)) / g',
        explanation: 'Total horizontal displacement; maximizes at θ = 45° in absence of air resistance.'
      },
      {
        label: 'Maximum Altitude',
        formula: 'H_max = (v₀² · sin²(θ)) / (2g)',
        explanation: 'Apex of flight where vertical component of velocity reaches zero (v_y = 0).'
      }
    ]
  },

  circuit: {
    domain: 'physics',
    type: 'circuit',
    title: 'DC Circuit: Ohm’s Law & Resistor Networks',
    topic: 'Current Electricity & Circuit Analysis',
    description:
      'Interactive circuit sandbox with live voltage source, series/parallel resistors, ammeter, and animated electron drift flow.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=1200&q=80',
    parameters: {
      voltage: 12,
      r1: 10,
      r2: 15,
      isParallel: 0 // 0 for series, 1 for parallel
    },
    interactiveControls: [
      { id: 'voltage', label: 'Source Potential (V)', min: 2, max: 36, step: 1, unit: 'V', defaultValue: 12 },
      { id: 'r1', label: 'Resistor R₁', min: 2, max: 50, step: 1, unit: 'Ω', defaultValue: 10 },
      { id: 'r2', label: 'Resistor R₂', min: 2, max: 50, step: 1, unit: 'Ω', defaultValue: 15 },
      { id: 'isParallel', label: 'Configuration (0: Series, 1: Parallel)', min: 0, max: 1, step: 1, unit: 'mode', defaultValue: 0 }
    ],
    formulas: [
      {
        label: 'Ohm’s Law',
        formula: 'I = V / R_total',
        explanation: 'Electric current flowing through a conductor is directly proportional to potential difference across it.'
      },
      {
        label: 'Series Equivalent Resistance',
        formula: 'R_eq = R₁ + R₂',
        explanation: 'In a series circuit, total resistance is the algebraic sum of individual resistors.'
      },
      {
        label: 'Joule Dissipation Power',
        formula: 'P = V · I = I² · R',
        explanation: 'Rate at which electrical energy is transformed into thermal energy.'
      }
    ]
  },

  inclined_plane: {
    domain: 'physics',
    type: 'inclined_plane',
    title: 'Newtonian Mechanics: Inclined Plane & Free Body Diagram',
    topic: 'Laws of Motion & Friction',
    description:
      'Interactive free-body diagram showing resolution of weight into normal (mg cos θ) and downhill (mg sin θ) components, frictional resistance, and net acceleration.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    parameters: {
      angle: 30,
      mass: 6,
      frictionCoeff: 0.2,
      gravity: 9.8
    },
    interactiveControls: [
      { id: 'angle', label: 'Incline Angle (θ)', min: 5, max: 70, step: 1, unit: '°', defaultValue: 30 },
      { id: 'mass', label: 'Block Mass (m)', min: 1, max: 20, step: 0.5, unit: 'kg', defaultValue: 6 },
      { id: 'frictionCoeff', label: 'Friction Coeff (μ)', min: 0.0, max: 0.7, step: 0.02, unit: '', defaultValue: 0.2 },
      { id: 'gravity', label: 'Gravity (g)', min: 1.6, max: 15.0, step: 0.2, unit: 'm/s²', defaultValue: 9.8 }
    ],
    formulas: [
      {
        label: 'Normal Reaction Force',
        formula: 'N = m · g · cos(θ)',
        explanation: 'Perpendicular contact force exerted by the ramp surface preventing the block from sinking.'
      },
      {
        label: 'Downhill Force Component',
        formula: 'F_down = m · g · sin(θ)',
        explanation: 'Component of weight acting parallel down the incline.'
      },
      {
        label: 'Newton’s Second Law Acceleration',
        formula: 'a = g · (sin(θ) - μ · cos(θ))  [if F_down > f_friction]',
        explanation: 'Net downhill acceleration of block after overcoming frictional resistance.'
      }
    ]
  }
};
