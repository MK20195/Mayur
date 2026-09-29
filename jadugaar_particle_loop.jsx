// Jadugaar: Abstract Particle Loop
// Seamless 5s loop: orbiting particle rings around a pulsing core, with a
// color controller. All motion is native keyframes (start value == end value).
//
// Editable after running:
//   - Colors      -> "Controller" layer > Effects Controls > Color A / Color B / Background
//   - Core pulse  -> "Core" layer > Scale keyframes
//   - Ring speed  -> "Ring N" layer > Rotation keyframes (end value = full turns)
//   - Particles   -> "Ring N" layer > Contents > Particles > Ellipse Path / Repeater copies

try {
    app.beginUndoGroup("Jadugaar: Particle Loop");

    var W = 1920, H = 1080, DUR = 5, FPS = 30;
    var comp = app.project.items.addComp("Jadugaar Particle Loop", W, H, 1, DUR, FPS);
    var CX = W / 2, CY = H / 2;

    // ---- Controller null with color rig ----
    var ctrl = comp.layers.addNull(DUR);
    ctrl.name = "Controller";
    var fx = ctrl.property("Effects");
    var cA = fx.addProperty("ADBE Color Control"); cA.name = "Color A";
    cA.property("ADBE Color Control-0001").setValue([1.0, 0.75, 0.25]);
    var cB = fx.addProperty("ADBE Color Control"); cB.name = "Color B";
    cB.property("ADBE Color Control-0001").setValue([0.2, 0.55, 1.0]);
    var cBg = fx.addProperty("ADBE Color Control"); cBg.name = "Background";
    cBg.property("ADBE Color Control-0001").setValue([0.02, 0.02, 0.05]);

    // ---- Background ----
    var bg = comp.layers.addSolid([0.02, 0.02, 0.05], "Background", W, H, 1, DUR);
    bg.property("Effects").addProperty("ADBE Fill").property("ADBE Fill-0002")
        .expression = 'thisComp.layer("Controller").effect("Background")("Color")';
    bg.moveToEnd();

    // ---- Core ----
    var core = comp.layers.addShape();
    core.name = "Core";
    var cg = core.property("Contents").addProperty("ADBE Vector Group");
    cg.name = "Core";
    var ce = cg.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    ce.property("ADBE Vector Ellipse Size").setValue([140, 140]);
    var cf = cg.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    cf.property("ADBE Vector Fill Color").expression =
        'thisComp.layer("Controller").effect("Color A")("Color")';
    core.property("Transform").property("Position").setValue([CX, CY]);
    var cs = core.property("Transform").property("Scale");
    cs.setValueAtTime(0, [100, 100]);
    cs.setValueAtTime(DUR / 2, [135, 135]);
    cs.setValueAtTime(DUR, [100, 100]);
    var glow = core.property("Effects").addProperty("ADBE Glo2");
    glow.property("ADBE Glo2-0002").setValue(60);
    glow.property("ADBE Glo2-0003").setValue(80);

    // ---- Particle rings ----
    // radius, particle count, dot size, turns per loop (integer = seamless), colour ref
    var rings = [
        { r: 200, n: 12, d: 16, turns:  1, c: "Color A" },
        { r: 320, n: 20, d: 12, turns: -1, c: "Color B" },
        { r: 440, n: 30, d: 9,  turns:  2, c: "Color A" },
        { r: 560, n: 42, d: 7,  turns: -2, c: "Color B" }
    ];

    for (var i = 0; i < rings.length; i++) {
        var R = rings[i];
        var L = comp.layers.addShape();
        L.name = "Ring " + (i + 1);
        L.property("Transform").property("Position").setValue([CX, CY]);

        var grp = L.property("Contents").addProperty("ADBE Vector Group");
        grp.name = "Particles";
        var dot = grp.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
        dot.property("ADBE Vector Ellipse Size").setValue([R.d, R.d]);
        dot.property("ADBE Vector Position").setValue([R.r, 0]);
        var fill = grp.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").expression =
            'thisComp.layer("Controller").effect("' + R.c + '")("Color")';

        var rep = grp.property("Contents").addProperty("ADBE Vector Filter - Repeater");
        rep.property("ADBE Vector Repeater Copies").setValue(R.n);
        var rt = rep.property("ADBE Vector Repeater Transform");
        rt.property("ADBE Vector Repeater Position").setValue([0, 0]);
        rt.property("ADBE Vector Repeater Rotation").setValue(360 / R.n);
        // Fade particles around the ring for a comet-like tail
        rt.property("ADBE Vector Repeater Start Opacity").setValue(100);
        rt.property("ADBE Vector Repeater End Opacity").setValue(15);

        var rot = L.property("Transform").property("Rotation");
        rot.setValueAtTime(0, 0);
        rot.setValueAtTime(DUR, 360 * R.turns);
        // Linear interpolation so the loop has no ease at the seam
        for (var k = 1; k <= 2; k++) rot.setInterpolationTypeAtKey(k, KeyframeInterpolationType.LINEAR);

        // Breathing radius: scale pulses, identical at start and end
        var sc = L.property("Transform").property("Scale");
        var amp = 6 + i * 2;
        sc.setValueAtTime(0, [100, 100]);
        sc.setValueAtTime(DUR / 2, [100 + amp, 100 + amp]);
        sc.setValueAtTime(DUR, [100, 100]);

        var g = L.property("Effects").addProperty("ADBE Glo2");
        g.property("ADBE Glo2-0002").setValue(50);
        g.property("ADBE Glo2-0003").setValue(40);
    }

    app.endUndoGroup();

    alert("Jadugaar: 'Jadugaar Particle Loop' comp created (5s seamless loop).\n\n" +
          "- Recolor: 'Controller' layer > Effects Controls > Color A / Color B / Background\n" +
          "- Core pulse: 'Core' layer > Scale keyframes\n" +
          "- Ring speed/direction: 'Ring N' > Rotation end keyframe\n" +
          "- Particle count: 'Ring N' > Contents > Particles > Repeater > Copies");

} catch (e) {
    alert("Jadugaar error: " + e.toString());
}
