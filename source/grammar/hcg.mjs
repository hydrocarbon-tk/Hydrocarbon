let fn = {}; const 
/************** Maps **************/

    /* Symbols To Inject into the Lexer */
    symbols = ["((","))","<>","+>","=>","(*","(+","::","$eof"],

    /* Goto lookup maps */
    gt0 = [0,-1,1,4,3,2,5,7,8,6,11,9,10,-5,12,13],
gt1 = [0,-54,16,17,-5,18],
gt2 = [0,-2,22,-2,5,7,8,6,11,9,10,-5,12,13],
gt3 = [0,-20,30,31],
gt4 = [0,-18,37,-36,36,-5,38],
gt5 = [0,-42,40,39,42,-3,41],
gt6 = [0,-42,46,-1,42,-3,47],
gt7 = [0,-44,42,-3,48],
gt8 = [0,-26,50,49,-4,51,-5,52,53,54],
gt9 = [0,-24,60,59,-2,61,-1,66,65,-6,62,63,64],
gt10 = [0,-33,68,-4,69,70,71],
gt11 = [0,-20,73,31],
gt12 = [0,-44,42,-3,74],
gt13 = [0,-26,50,75,-4,51,-5,52,53,54],
gt14 = [0,-12,76,79,77],
gt15 = [0,-19,82,-1,83],
gt16 = [0,-45,92,90,91],
gt17 = [0,-32,104,-5,52,53,54],
gt18 = [0,-44,42,-3,105],
gt19 = [0,-44,42,-3,106],
gt20 = [0,-28,109,-1,66,65,-6,62,63,64],
gt21 = [0,-29,110],
gt22 = [0,-21,83],
gt23 = [0,-13,79,118],
gt24 = [0,-13,121,-1,120],
gt25 = [0,-35,129,128,127,133,136,137,134,135,-1,42,-3,140,-7,123,124,125,126,130,-8,131],
gt26 = [0,-35,129,128,127,133,136,137,134,135,-1,42,-3,140,-7,144,124,125,126,130,-8,131],
gt27 = [0,-44,42,-3,145],
gt28 = [0,-45,147,-1,146],
gt29 = [0,-35,129,128,127,133,136,137,134,135,-1,42,-3,140,-7,148,124,125,126,130,-8,131],
gt30 = [0,-49,150,-3,149],
gt31 = [0,-20,155,31,-48,154,156],
gt32 = [0,-13,121,-1,159],
gt33 = [0,-16,160],
gt34 = [0,-18,165],
gt35 = [0,-35,170,-2,133,136,137,134,135,-1,42,-3,140,-11,169,-3,167,-3,166,168],
gt36 = [0,-34,173],
gt37 = [0,-35,129,-2,133,136,137,134,135,-1,42,-3,140,-10,176,130,-8,131],
gt38 = [0,-35,129,128,127,133,136,137,134,135,-1,42,-3,140,-7,177,124,125,126,130,-8,131],
gt39 = [0,-50,185,183,184],
gt40 = [0,-20,155,31,-48,193,156],
gt41 = [0,-20,155,31,-48,194,156],
gt42 = [0,-16,195],
gt43 = [0,-44,42,-3,196],
gt44 = [0,-35,129,128,127,133,136,137,134,135,-1,42,-3,140,-8,197,125,126,130,-8,131],
gt45 = [0,-64,198],
gt46 = [0,-62,203,204,-1,200,201,202],
gt47 = [0,-33,211,-4,69,70,71],
gt48 = [0,-35,170,-2,133,136,137,134,135,-1,42,-3,140,-11,169,-8,168],
gt49 = [0,-22,216,215,-9,217,-4,69,70,71],
gt50 = [0,-22,216,218,-9,217,-4,69,70,71],
gt51 = [0,-22,216,219,-9,217,-4,69,70,71],
gt52 = [0,-20,155,31,-48,220,156],
gt53 = [0,-49,150,-3,221],
gt54 = [0,-50,223,-1,222],
gt55 = [0,-44,42,-3,225],
gt56 = [0,-62,203,204],
gt57 = [0,-33,234,-4,69,70,71],
gt58 = [0,-20,155,31,-48,239,156],
gt59 = [0,-49,150,-3,240],
gt60 = [0,-49,150,-3,241],
gt61 = [0,-20,155,31,-48,242,156],
gt62 = [0,-49,150,-3,243],

    // State action lookup maps
    sm0=[0,1,-3,0,-4,0,-4,2,-14,3,-17,1,-1,1,-6,1],
sm1=[0,4,-3,0,-4,0],
sm2=[0,5,-3,0,-4,0,-19,5,-17,6,-1,7,-6,8],
sm3=[0,9,-3,0,-4,0,-4,2,-14,3,-17,9,-1,9,-6,9],
sm4=[0,10,-3,0,-4,0,-4,10,-14,10,-17,10,-1,10,-6,10],
sm5=[0,11,-3,0,-4,0,-4,11,-14,11,-17,11,-1,11,-6,11],
sm6=[0,12,-3,0,-4,0,-4,12,-14,12,-17,12,-1,12,-6,12],
sm7=[0,-4,-1,-4,0,-5,13,-2,14,-1,15,16,17,18,-4,19],
sm8=[0,-1,20,21,-1,22,-4,0,-3,23],
sm9=[0,24,-3,0,-4,0,-19,3,-17,6,-1,7,-6,8],
sm10=[0,25,-3,0,-4,0,-19,25,-17,25,-1,25,-6,25],
sm11=[0,26,-3,0,-4,0,-19,26,-17,26,-1,26,-6,26],
sm12=[0,-1,27,28,-1,0,-4,0,-33,29],
sm13=[0,30,-3,0,-4,0,-4,30,-14,30,-17,30,-1,30,-6,30],
sm14=[0,-4,0,-4,0,-3,31,-25,32,33,34],
sm15=[0,-4,0,-4,0,-3,35,-25,32,33,34],
sm16=[0,-4,0,-4,0,-3,36,-25,32,33,34],
sm17=[0,-2,37,-1,38,-4,0,-3,39],
sm18=[0,40,20,21,-1,22,-4,41,-3,23,-17,42],
sm19=[0,43,43,43,-1,43,-4,43,-3,43,-17,43,-26,43,43],
sm20=[0,44,44,44,-1,44,-4,44,-3,44,-17,44,-26,44,44],
sm21=[0,45,-3,0,-4,0,-19,45,-17,45,-1,45,-6,45],
sm22=[0,46,-3,0,-4,0,-19,46,-17,46,-1,46,-6,46],
sm23=[0,47,-3,0,-4,0,-19,47,-17,47,-1,47,-6,47],
sm24=[0,-4,0,-4,0,-38,48],
sm25=[0,-4,0,-4,0,-38,49],
sm26=[0,-4,0,-4,0,-32,50,-5,51],
sm27=[0,52,-1,53,-1,54,-4,55,-3,52,-15,52,-2,52,52,52,52,52,-2,52,52,52,52,56,57,58,59,52,52,52,52,-1,52,-3,52,52,52],
sm28=[0,60,-1,60,-1,60,-4,60,-3,60,-15,60,-2,60,60,60,60,60,-2,60,60,60,60,60,60,60,60,60,60,60,60,-1,60,-3,60,60,60],
sm29=[0,-4,0,-4,0,-38,61],
sm30=[0,-4,0,-4,0,-32,50],
sm31=[0,-4,0,-4,0,-47,62,63],
sm32=[0,-4,0,-4,64],
sm33=[0,-4,0,-4,65,-3,31,-25,32,33,34],
sm34=[0,-4,0,-4,66,-3,66,-25,66,66,66],
sm35=[0,-4,0,-4,67,-3,67,-25,67,67,67],
sm36=[0,-1,27,28,-1,-1,-4,-1,-33,29],
sm37=[0,-4,-1,-4,-1,-3,68],
sm38=[0,-4,0,-4,69],
sm39=[0,-4,0,-4,70,-3,35,-25,32,33,34],
sm40=[0,-4,0,-4,71,-3,71,-25,71,71,71],
sm41=[0,-4,0,-4,72,-3,72,-25,72,72,72],
sm42=[0,-4,73,-4,74],
sm43=[0,-4,75,-4,75,-3,76],
sm44=[0,-4,77,-4,77,-3,77],
sm45=[0,-1,78,-2,0,-4,0],
sm46=[0,-1,79,-2,0,-4,0,-3,79,-21,79,-3,79,79,79],
sm47=[0,-1,80,-2,0,-4,0,-3,80,-21,80,-3,80,80,80],
sm48=[0,-1,20,21,-1,22,-4,81,-3,23],
sm49=[0,-4,0,-4,82],
sm50=[0,-4,0,-4,83],
sm51=[0,-2,37,-1,84,-4,0,-3,39],
sm52=[0,-2,37,-1,85,-4,0,-3,39],
sm53=[0,-2,86,-1,86,-4,0,-3,86],
sm54=[0,-2,87,-1,87,-4,0,-3,87],
sm55=[0,-2,88,-1,88,-4,0,-3,88],
sm56=[0,89,-3,0,-4,0,-4,89,-14,89,-5,89,-11,89,-1,89,89,-5,89],
sm57=[0,90,90,90,-1,90,-4,90,-3,90,-17,90,-26,90,90],
sm58=[0,91,-3,0,-4,0,-4,91,-14,91,-5,91,-11,91,-1,91,91,-5,91],
sm59=[0,92,27,28,-1,0,-4,0,-3,93,-20,94,-3,95,32,33,34,-1,29,-7,96,-4,97],
sm60=[0,98,-1,53,-1,54,-4,55,-3,98,-15,98,-2,98,98,98,98,98,-2,98,98,98,98,56,57,58,59,98,98,98,98,-1,98,-3,98,98,98],
sm61=[0,99,99,99,-1,0,-4,99,-3,99,-15,99,-2,99,99,99,99,99,-2,99,99,99,99,99,-3,99,99,99,99,-1,99,-3,99,99,99],
sm62=[0,100,-1,100,-1,100,-4,100,-3,100,-15,100,-2,100,100,100,100,100,-2,100,100,100,100,100,100,100,100,100,100,100,100,-1,100,-3,100,100,100],
sm63=[0,101,-1,101,-1,101,-4,101,-3,101,-15,101,-2,101,101,101,101,101,-2,101,101,101,101,101,101,101,101,101,101,101,101,-1,101,-3,101,101,101],
sm64=[0,102,102,102,-1,0,-4,102,-3,102,-15,102,-2,102,102,102,102,102,-2,102,102,102,102,102,-3,102,102,102,102,-1,102,-3,102,102,102],
sm65=[0,-2,103,-1,-1,-4,0,-33,104,-1,105],
sm66=[0,-1,20,21,-1,22,-4,0,-3,23,-44,106,107],
sm67=[0,108,-3,0,-4,0,-4,108,-14,108,-17,108,-1,108,-6,108],
sm68=[0,-4,0,-4,109,-3,109,-25,109,109,109],
sm69=[0,110,110,110,-1,0,-4,110,-3,110,-15,110,-2,110,110,110,110,110,-2,110,110,110,-1,110,-3,110,-1,110,110,-1,110,-3,110],
sm70=[0,111,111,111,-1,0,-4,111,-3,111,-15,111,-2,111,111,111,111,111,-2,111,111,111,-1,111,-3,111,-1,111,111,-1,111,-3,111],
sm71=[0,112,112,112,-1,0,-4,112,-3,112,-15,112,-2,112,112,112,112,112,-2,112,112,112,-1,112,-3,112,-1,112,112,-1,112,-3,112],
sm72=[0,113,-3,0,-4,0,-4,113,-14,113,-17,113,-1,113,-6,113],
sm73=[0,-4,0,-4,114,-3,114,-25,114,114,114],
sm74=[0,-4,0,-4,115,-3,115,-25,115,115,115],
sm75=[0,-4,0,-4,116,-3,116,-25,116,116,116],
sm76=[0,-4,117,-4,117,-3,117],
sm77=[0,-4,0,-4,118],
sm78=[0,119,-3,0,-4,0,-4,119,-14,119,-17,119,-1,119,-6,119],
sm79=[0,120,-3,0,-4,0,-4,120,-14,120,-17,120,-1,120,-6,120],
sm80=[0,121,-3,0,-4,0,-4,121,-14,121,-17,121,-1,121,-6,121],
sm81=[0,-2,122,-1,122,-4,0,-3,122],
sm82=[0,-4,123,-4,0,-16,124,125],
sm83=[0,-2,126,-1,126,-4,0,-3,126],
sm84=[0,-4,127,-4,0,-16,127,127],
sm85=[0,128,-3,0,-4,0,-19,3,-17,128,-1,128,129,-5,128],
sm86=[0,130,-3,0,-4,0,-19,130,-5,130,-11,130,-1,130,130,-5,130],
sm87=[0,131,-3,0,-4,0,-19,131,-5,131,-11,131,-1,131,131,-5,131],
sm88=[0,132,27,28,-1,0,-4,0,-3,93,-15,132,-4,94,132,-3,32,33,34,-1,29,-3,132,-1,132,132,-5,133],
sm89=[0,134,-3,0,-4,0,-19,134,-5,134,-11,134,-1,134,134,-5,134],
sm90=[0,135,-3,0,-4,0,-19,135,-5,135,-11,135,-1,135,135,-5,135],
sm91=[0,136,136,136,-1,0,-4,0,-3,136,-15,136,-2,137,138,136,136,139,-2,136,136,136,-1,136,-3,136,-1,136,136,-1,136,-3,136],
sm92=[0,136,136,136,-1,0,-4,0,-3,136,-15,136,-4,136,136,-3,136,136,136,-1,136,-3,136,-1,136,136,-1,136,-3,136],
sm93=[0,-1,27,28,-1,0,-4,0,-3,93,-20,94,-4,32,33,34,-1,29,-7,96,-4,97],
sm94=[0,140,140,140,-1,0,-4,0,-3,140,-15,140,-2,140,140,140,140,140,-2,140,140,140,-1,140,-3,140,-1,140,140,-1,140,-3,140],
sm95=[0,92,27,28,-1,0,-4,0,-3,93,-20,94,-3,95,32,33,34,-1,29,-7,96,-1,141,142,143,97],
sm96=[0,144,144,144,-1,0,-4,0,-3,144,-15,144,-2,144,144,144,144,144,-2,144,144,144,-1,144,-3,144,-1,144,144,-1,144,-3,144],
sm97=[0,145,145,145,-1,0,-4,0,-3,145,-15,145,-2,145,145,145,145,145,-2,145,145,145,50,145,-3,145,-1,145,145,-1,145,-3,145],
sm98=[0,-4,0,-4,0,-47,146,147],
sm99=[0,148,-3,0,-4,0,-19,148,-5,148,-11,148,-1,148,148,-5,148],
sm100=[0,149,-3,0,-4,0,-19,149,-5,149,-11,149,-1,149,149,-5,149],
sm101=[0,150,-3,0,-4,0,-19,3,-17,150,-1,150,129,-5,150],
sm102=[0,151,151,151,-1,0,-4,0,-3,151,-15,151,-2,151,151,151,151,151,-2,151,151,151,-1,151,-3,151,151,151,151,-1,151,-3,151],
sm103=[0,152,152,152,-1,0,-4,152,-3,152,-15,152,-2,152,152,152,152,152,-2,152,152,152,152,152,-3,152,152,152,152,-1,152,-3,152,152,152],
sm104=[0,153,-1,153,-1,153,-4,153,-3,153,-15,153,-2,153,153,153,153,153,-2,153,153,153,153,153,153,153,153,153,153,153,153,-1,153,-3,153,153,153],
sm105=[0,154,-3,0,-4,0,-19,3,-17,154,-1,154,129,-5,154],
sm106=[0,155,-3,0,-4,0,-19,155,-17,155,-1,155,-6,155],
sm107=[0,156,-1,157,-1,158,-4,159,-3,156,-15,156,-4,156,156,-3,156,156,156,-1,160,-1,161,162,156,-1,156,156,-1,156,-3,156],
sm108=[0,163,-1,163,-1,163,-4,163,-3,163,-15,163,-4,163,163,-3,163,163,163,-1,163,-1,163,163,163,-1,163,163,-1,163,-3,163],
sm109=[0,-1,20,21,-1,22,-4,0,-3,23,-44,106,164],
sm110=[0,-1,20,21,-1,22,-4,0,-3,23,-44,165,165],
sm111=[0,-1,165,165,-1,165,-4,0,-3,165,-44,165,165],
sm112=[0,166,-3,0,-4,0,-4,166,-14,166,-17,166,-1,166,-6,166],
sm113=[0,-4,167,-4,0,-16,167,167],
sm114=[0,-1,168,168,-1,0,-4,0,-33,168],
sm115=[0,169,-3,0,-4,0,-19,169,-5,169,-11,169,-1,169,169,-5,169],
sm116=[0,170,-3,0,-4,0,-19,170,-5,170,-11,170,-1,170,170,-5,171],
sm117=[0,172,-3,0,-4,0,-19,172,-5,172,-11,172,-1,172,172,-5,172],
sm118=[0,173,173,173,-1,0,-4,0,-3,173,-15,173,-4,173,173,-3,173,173,173,-1,173,-3,173,-1,173,173,-1,173,-3,173],
sm119=[0,173,173,173,-1,0,-4,0,-3,173,-15,173,-2,137,138,173,173,139,-2,173,173,173,-1,173,-3,173,-1,173,173,-1,173,-3,173],
sm120=[0,-4,0,-4,0,-47,146,147,-1,174,175,176,177,178,179],
sm121=[0,180,180,180,-1,0,-4,0,-3,180,-15,180,-2,180,180,180,180,180,-2,180,180,180,-1,180,-3,180,-1,180,180,-1,180,-3,180],
sm122=[0,-4,0,-4,0,-3,36,-21,181,-3,32,33,34],
sm123=[0,-4,0,-4,0,-3,182,-21,182,-3,182,182,182],
sm124=[0,-1,27,28,-1,0,-4,0,-3,93,-20,94,-4,32,33,34,-1,29,-8,183,-3,97],
sm125=[0,-4,0,-4,0,-19,3,-5,184,-14,129],
sm126=[0,-2,103,-1,-1,-4,-1,-33,104,-1,105],
sm127=[0,185,-1,157,-1,158,-4,159,-3,185,-15,185,-4,185,185,-3,185,185,185,-1,160,-1,161,162,185,-1,185,185,-1,185,-3,185],
sm128=[0,186,186,186,-1,0,-4,0,-3,186,-15,186,-4,186,186,-3,186,186,186,-1,186,-3,186,-1,186,186,-1,186,-3,186],
sm129=[0,187,-1,187,-1,187,-4,187,-3,187,-15,187,-4,187,187,-3,187,187,187,-1,187,-1,187,187,187,-1,187,187,-1,187,-3,187],
sm130=[0,188,-1,188,-1,188,-4,188,-3,188,-15,188,-4,188,188,-3,188,188,188,-1,188,-1,188,188,188,-1,188,188,-1,188,-3,188],
sm131=[0,189,189,189,-1,0,-4,0,-3,189,-15,189,-4,189,189,-3,189,189,189,-1,189,-3,189,-1,189,189,-1,189,-3,189],
sm132=[0,190,-3,0,-4,0,-19,190,-17,190,-1,190,-6,190],
sm133=[0,-1,20,21,-1,22,-4,0,-3,23,-44,106,191],
sm134=[0,-1,20,21,-1,22,-4,0,-3,23,-44,106,192],
sm135=[0,-4,0,-4,193],
sm136=[0,194,-3,0,-4,0,-19,194,-5,194,-11,194,-1,194,194,-5,194],
sm137=[0,195,-3,0,-4,0,-19,195,-5,195,-11,195,-1,195,195,-5,195],
sm138=[0,-4,0,-4,0,-50,174,175],
sm139=[0,-4,0,-4,0,-48,196],
sm140=[0,-4,0,-4,0,-47,197],
sm141=[0,-4,0,-4,0,-56,198],
sm142=[0,-4,0,-4,0,-48,199],
sm143=[0,-4,0,-4,0,-47,200],
sm144=[0,-4,0,-4,0,-47,201,202,-7,203],
sm145=[0,-4,0,-4,0,-47,204,205],
sm146=[0,-4,0,-4,0,-25,206],
sm147=[0,207,207,207,-1,0,-4,0,-3,207,-15,207,-2,207,207,207,207,207,-2,207,207,207,-1,207,-3,207,-1,207,207,-1,207,-3,207],
sm148=[0,208,208,208,-1,0,-4,0,-3,208,-15,208,-4,208,208,-3,208,208,208,-1,208,-3,208,-1,208,208,-1,208,-3,208],
sm149=[0,209,209,209,-1,0,-4,0,-3,209,-15,209,-2,209,209,209,209,209,-2,209,209,209,-1,209,-3,209,-1,209,209,-1,209,-3,209],
sm150=[0,-4,0,-4,0,-25,210],
sm151=[0,-4,0,-4,0,-3,36,-21,211,-3,32,33,34],
sm152=[0,-4,0,-4,0,-3,212,-21,212,-3,212,212,212],
sm153=[0,-4,0,-4,0,-25,213],
sm154=[0,-4,0,-4,0,-25,214],
sm155=[0,-1,20,21,-1,22,-4,0,-3,23,-44,106,215],
sm156=[0,216,216,216,-1,0,-4,0,-3,216,-15,216,-4,216,216,-3,216,216,216,-1,216,-3,216,-1,216,216,-1,216,-3,216],
sm157=[0,217,217,217,-1,0,-4,0,-3,217,-15,217,-4,217,217,-3,217,217,217,-1,217,-3,217,-1,217,217,-1,217,-3,217],
sm158=[0,218,-1,218,-1,218,-4,218,-3,218,-15,218,-4,218,218,-3,218,218,218,-1,218,-1,218,218,218,-1,218,218,-1,218,-3,218],
sm159=[0,-1,219,219,-1,219,-4,0,-3,219,-44,219,219],
sm160=[0,-4,0,-4,220],
sm161=[0,221,-3,0,-4,0,-4,221,-14,221,-17,221,-1,221,-6,221],
sm162=[0,-2,103,-1,0,-4,0,-33,104,-1,105],
sm163=[0,222,222,222,-1,0,-4,0,-3,222,-15,222,-2,222,222,222,222,222,-2,222,222,222,-1,222,-3,222,-1,222,222,-1,222,-3,222],
sm164=[0,223,223,223,-1,0,-4,0,-3,223,-15,223,-4,223,223,-3,223,223,223,-1,223,-3,223,-1,223,223,-1,223,-3,223],
sm165=[0,-4,0,-4,0,-3,224,-21,224,-3,224,224,224],
sm166=[0,225,225,225,-1,0,-4,0,-3,225,-15,225,-4,225,225,-3,225,225,225,-1,225,-3,225,-1,225,225,-1,225,-3,225],
sm167=[0,226,226,226,-1,0,-4,0,-3,226,-15,226,-4,226,226,-3,226,226,226,-1,226,-3,226,-1,226,226,-1,226,-3,226],
sm168=[0,227,227,227,-1,0,-4,0,-3,227,-15,227,-4,227,227,-3,227,227,227,-1,227,-3,227,-1,227,227,-1,227,-3,227],
sm169=[0,228,-3,0,-4,0,-4,228,-14,228,-17,228,-1,228,-6,228],
sm170=[0,-1,20,21,-1,22,-4,0,-3,23,-44,106,229],
sm171=[0,230,-3,0,-4,0,-19,230,-5,230,-11,230,-1,230,230,-5,230],
sm172=[0,231,-3,0,-4,0,-19,231,-5,231,-11,231,-1,231,231,-5,231],
sm173=[0,-1,20,21,-1,22,-4,0,-3,23,-44,106,232],
sm174=[0,233,-3,0,-4,0,-19,233,-5,233,-11,233,-1,233,233,-5,233],
sm175=[0,234,-3,0,-4,0,-19,234,-5,234,-11,234,-1,234,234,-5,234],
sm176=[0,235,-3,0,-4,0,-19,235,-5,235,-11,235,-1,235,235,-5,235],

    // Symbol Lookup map
    lu = new Map([[1,1],[2,2],[4,3],[8,4],[16,5],[32,6],[64,7],[128,8],[256,9],[512,10],[3,11],[264,11],[200,13],["@",14],["SYMBOL",15],[null,13],["PREC",18],["IGNORE",20],["ERROR",21],["NAME",22],["EXT",23],["AS",26],["as",27],["IMPORT",28],["#",29],["$eof",37],[";",31],["(+",32],["(*",33],["(",34],[")",35],["?",36],["ɛ",38],["θ",39],["τ",40],["\\",41],["::",42],["_",43],["-",44],["$",45],["num",46],["<>",47],["→",48],["+>",49],["│",50],["[",51],["]",52],["EXC",53],["ERR",54],["IGN",55],["↦",56],["^",57],["{",58],["}",59],["err",60],["e",61],["cstr",62],["c",63],["return",64],["r",65],["=>",66]]),

    //Reverse Symbol Lookup map
    rlu = new Map([[1,1],[2,2],[3,4],[4,8],[5,16],[6,32],[7,64],[8,128],[9,256],[10,512],[11,3],[11,264],[13,200],[14,"@"],[15,"SYMBOL"],[13,null],[18,"PREC"],[20,"IGNORE"],[21,"ERROR"],[22,"NAME"],[23,"EXT"],[26,"AS"],[27,"as"],[28,"IMPORT"],[29,"#"],[37,"$eof"],[31,";"],[32,"(+"],[33,"(*"],[34,"("],[35,")"],[36,"?"],[38,"ɛ"],[39,"θ"],[40,"τ"],[41,"\\"],[42,"::"],[43,"_"],[44,"-"],[45,"$"],[46,"num"],[47,"<>"],[48,"→"],[49,"+>"],[50,"│"],[51,"["],[52,"]"],[53,"EXC"],[54,"ERR"],[55,"IGN"],[56,"↦"],[57,"^"],[58,"{"],[59,"}"],[60,"err"],[61,"e"],[62,"cstr"],[63,"c"],[64,"return"],[65,"r"],[66,"=>"]]),

    // States 
    state = [sm0,
sm1,
sm2,
sm3,
sm4,
sm5,
sm6,
sm6,
sm6,
sm6,
sm6,
sm6,
sm6,
sm6,
sm7,
sm8,
sm9,
sm10,
sm11,
sm12,
sm12,
sm12,
sm13,
sm14,
sm15,
sm16,
sm8,
sm12,
sm14,
sm17,
sm18,
sm19,
sm20,
sm20,
sm20,
sm20,
sm21,
sm22,
sm23,
sm24,
sm25,
sm26,
sm27,
sm28,
sm28,
sm28,
sm29,
sm30,
sm31,
sm32,
sm33,
sm34,
sm35,
sm35,
sm35,
sm35,
sm36,
sm36,
sm37,
sm38,
sm39,
sm40,
sm41,
sm41,
sm41,
sm42,
sm43,
sm44,
sm45,
sm46,
sm46,
sm46,
sm47,
sm48,
sm49,
sm50,
sm51,
sm52,
sm53,
sm54,
sm55,
sm55,
sm56,
sm57,
sm58,
sm58,
sm58,
sm59,
sm59,
sm12,
sm60,
sm61,
sm62,
sm63,
sm63,
sm63,
sm63,
sm63,
sm64,
sm64,
sm59,
sm65,
sm66,
sm67,
sm68,
sm69,
sm70,
sm71,
sm72,
sm73,
sm74,
sm75,
sm75,
sm76,
sm77,
sm78,
sm79,
sm80,
sm52,
sm81,
sm82,
sm83,
sm84,
sm85,
sm86,
sm87,
sm88,
sm89,
sm90,
sm91,
sm92,
sm92,
sm93,
sm94,
sm94,
sm94,
sm94,
sm94,
sm95,
sm96,
sm97,
sm98,
sm99,
sm100,
sm101,
sm102,
sm103,
sm104,
sm105,
sm106,
sm107,
sm108,
sm108,
sm108,
sm109,
sm110,
sm111,
sm66,
sm112,
sm82,
sm12,
sm113,
sm114,
sm114,
sm59,
sm115,
sm116,
sm117,
sm118,
sm118,
sm119,
sm120,
sm121,
sm122,
sm123,
sm123,
sm124,
sm125,
sm16,
sm16,
sm16,
sm66,
sm126,
sm127,
sm128,
sm129,
sm130,
sm130,
sm130,
sm130,
sm131,
sm131,
sm132,
sm133,
sm134,
sm12,
sm135,
sm136,
sm137,
sm138,
sm139,
sm140,
sm141,
sm142,
sm143,
sm144,
sm144,
sm144,
sm144,
sm145,
sm145,
sm146,
sm147,
sm148,
sm149,
sm150,
sm151,
sm152,
sm153,
sm154,
sm155,
sm156,
sm157,
sm158,
sm159,
sm160,
sm161,
sm66,
sm126,
sm162,
sm66,
sm126,
sm163,
sm164,
sm165,
sm166,
sm167,
sm168,
sm169,
sm170,
sm171,
sm172,
sm173,
sm174,
sm175,
sm176],

/************ Functions *************/

    max = Math.max, min = Math.min,

    //Error Functions
    e = (tk,r,o,l,p)=>{if(l.END)l.throw("Unexpected end of input");else if(l.ty & (264)) l.throw(`Unexpected space character within input "${1}" `) ; else l.throw(`Unexpected token ${l.tx} within input "${111}" `)}, 
    eh = [e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e,
e],

    //Empty Function
    nf = ()=>-1, 

    //Environment Functions
    
redv = (ret, fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        o[ln] = fn(o.slice(-plen), e, l, s, o, plen);        o.length = ln + 1;        return ret;    },
rednv = (ret, Fn, plen, ln, t, e, o, l, s) => {        ln = max(o.length - plen, 0);        o[ln] = new Fn(o.slice(-plen), e, l, s, o, plen);        o.length = ln + 1;        return ret;    },
redn = (ret, plen, t, e, o, l, s) => {        if(plen > 0){            let ln = max(o.length - plen, 0);            o[ln] = o[o.length -1];            o.length = ln + 1;        }        return ret;    },
shftf = (ret, fn, t, e, o, l, s) => (fn(o, e, l, s), ret),
R00_hydrocarbon=function (sym,env,lex,state,output,len) {return env.productions},
R10_head=function (sym,env,lex,state,output,len) {return env.productions.meta = sym[0]},
R30_pre_preamble101_group_list=function (sym,env,lex,state,output,len) {return (sym[0].push(sym[1]),sym[0])},
R31_pre_preamble101_group_list=function (sym,env,lex,state,output,len) {return [sym[0]]},
C60_pre_symbols_preamble=function (sym,env,lex,state,output,len) {this.type = "symbols";this.symbols = sym[2];this.symbols.forEach(lex.addSymbol.bind(lex));},
C70_pre_precedence_preamble=function (sym,env,lex,state,output,len) {this.grammar_stamp = env.stamp;this.type = "precedence";this.terminal = sym[2];this.val = parseInt(sym[3]);},
C80_pre_ignore_preamble=function (sym,env,lex,state,output,len) {this.grammar_stamp = env.stamp;this.type = "ignore";this.symbols = sym[2];},
C90_pre_error_preamble=function (sym,env,lex,state,output,len) {this.grammar_stamp = env.stamp;this.type = "error";this.symbols = sym[2];},
C100_pre_name_preamble=function (sym,env,lex,state,output,len) {this.type = "name";this.id = sym[2];},
C110_pre_ext_preamble=function (sym,env,lex,state,output,len) {this.type = "ext";this.id = sym[2];},
R140_pre_import_preamble1802_group_list=function (sym,env,lex,state,output,len) {return sym[0] + sym[1]},
R141_pre_import_preamble1802_group_list=function (sym,env,lex,state,output,len) {return sym[0] + ""},
C180_cm_comment=function (sym,env,lex,state,output,len) {this.val = sym[1];},
R200_cm_comment_data=function (sym,env,lex,state,output,len) {return sym[0]},
C330_sym_terminal_symbol=function (sym,env,lex,state,output,len) {this.type = "symbol";this.val = sym[0];},
R350_sym_symbol=function (sym,env,lex,state,output,len) {return (sym[0].IS_OPTIONAL = true,sym[0])},
C360_sym_EOF_symbol=function (sym,env,lex,state,output,len) {this.type = "eof";this.val = "$eof";},
C370_sym_empty_symbol=function (sym,env,lex,state,output,len) {this.type = "empty";},
C380_sym_generated_symbol=function (sym,env,lex,state,output,len) {this.type = "generated";this.val = sym[1];},
C390_sym_literal_symbol=function (sym,env,lex,state,output,len) {this.type = "literal";this.val = sym[1];},
C400_sym_escaped_symbol=function (sym,env,lex,state,output,len) {this.type = "escaped";this.val = sym[1];},
C410_sym_production_symbol=function (sym,env,lex,state,output,len) {this.type = "production";this.name = sym[0];this.val = -1;},
R540_prd_productions=function (sym,env,lex,state,output,len) {return (!(sym[0].IMPORT_OVERRIDE || sym[0].IMPORT_APPEND)) ? env.productions.push(sym[0]) : 0},
R541_prd_productions=function (sym,env,lex,state,output,len) {return (env.refs.set(sym[0].id,sym[0]),null)},
R542_prd_productions=function (sym,env,lex,state,output,len) {return (sym[1].id = env.productions.length,(!(sym[1].IMPORT_OVERRIDE || sym[1].IMPORT_APPEND)) ? env.productions.push(sym[1]) : 0,env.productions)},
R543_prd_productions=function (sym,env,lex,state,output,len) {return (env.refs.set(sym[1].id,sym[1]),sym[0])},
C550_prd_production=function (sym,env,lex,state,output,len) {this.name = sym[1];this.bodies = sym[3];this.id = -1;env.functions.compileProduction(this);},
I551_prd_production=function (sym,env,lex,state,output,len) {env.host_lex = lex.copy(); env.prod_name = sym[sym.length - 1];},
C552_prd_production=function (sym,env,lex,state,output,len) {this.IMPORT_OVERRIDE = true;this.name = sym[1];this.bodies = sym[3];this.id = -1;env.functions.compileProduction(this);},
I553_prd_production=function (sym,env,lex,state,output,len) {env.host_lex = lex.copy(); env.prod_name = sym[sym.length - 1].name;},
C554_prd_production=function (sym,env,lex,state,output,len) {this.IMPORT_APPEND = true;this.name = sym[1];this.bodies = sym[3];this.id = -1;env.functions.compileProduction(this);},
R560_pb_production_bodies=function (sym,env,lex,state,output,len) {return (env.body_count++,[sym[0]])},
R561_pb_production_bodies=function (sym,env,lex,state,output,len) {return (env.body_count++,sym[0].push(sym[2]),sym[0])},
I562_pb_production_bodies=function (sym,env,lex,state,output,len) {env.host_lex = lex.copy()},
C580_pb_entries=function (sym,env,lex,state,output,len) {this.body = sym[0];this.reduce = sym[1];this.err = sym[2];},
C581_pb_entries=function (sym,env,lex,state,output,len) {this.body = [];this.reduce = null;},
C582_pb_entries=function (sym,env,lex,state,output,len) {this.reduce = null;this.body = [sym[0]];},
C583_pb_entries=function (sym,env,lex,state,output,len) {this.body = sym[0];this.err = sym[1];},
C584_pb_entries=function (sym,env,lex,state,output,len) {this.body = sym[0];this.reduce = sym[1];},
C585_pb_entries=function (sym,env,lex,state,output,len) {this.body = sym[0];},
R590_pb_body_entries=function (sym,env,lex,state,output,len) {return (env.body_offset = 0,[sym[0]])},
R591_pb_body_entries=function (sym,env,lex,state,output,len) {return (env.body_offset = sym[0].length,sym[0].push(sym[1]),sym[0])},
R592_pb_body_entries=function (sym,env,lex,state,output,len) {return sym[1].map(e => ((e.NO_BLANK = true,e)))},
C600_pb_condition_clause=function (sym,env,lex,state,output,len) {this.type = "exc";this.sym = sym[2];this.offset = -1;},
C601_pb_condition_clause=function (sym,env,lex,state,output,len) {this.type = "err";this.sym = sym[2];this.offset = -1;},
C602_pb_condition_clause=function (sym,env,lex,state,output,len) {this.type = "ign";this.sym = sym[2];this.offset = -1;},
C610_fn_referenced_function=function (sym,env,lex,state,output,len) {this.id = sym[1];this.name = sym[3];this.txt = "";this.env = true;},
C611_fn_referenced_function=function (sym,env,lex,state,output,len) {this.id = sym[1];this.txt = sym[3];this.env = false;this.name = "";},
C640_fn_error_function=function (sym,env,lex,state,output,len) {this.type = "ERROR";this.txt = sym[3];this.name = "";this.env = false;this.ref = "";},
C641_fn_error_function=function (sym,env,lex,state,output,len) {this.type = "ERROR";this.txt = "";this.name = sym[3];this.env = true;this.ref = "";},
C680_fn_reduce_function=function (sym,env,lex,state,output,len) {this.type = (sym[1][0] == "c") ? "CLASS" : "RETURNED";this.txt = sym[3];this.name = "";this.env = false;this.ref = "";},
C681_fn_reduce_function=function (sym,env,lex,state,output,len) {this.type = (sym[1][0] == "c") ? "CLASS" : "RETURNED";this.txt = "";this.name = sym[3];this.env = true;this.ref = "";},
C682_fn_reduce_function=function (sym,env,lex,state,output,len) {this.type = (sym[1][0] == "c") ? "CLASS" : "RETURNED";this.ref = sym[3];this.txt = "";this.name = "";this.env = true;const ref = env.refs.get(this.ref);if(ref)if(Array.isArray(ref))ref.push(this); else {let ref = env.refs.get(this.ref);this.env = ref.env;this.name = ref.name;this.txt = ref.txt;} else env.refs.set(this.ref,[this]);},
C690_fn_function_clause=function (sym,env,lex,state,output,len) {this.type = "INLINE";this.txt = sym[2];this.name = "";this.env = false;},
C691_fn_function_clause=function (sym,env,lex,state,output,len) {this.type = "INLINE";this.txt = "";this.name = sym[2];this.env = true;},
R710_fn_js_data_block=function (sym,env,lex,state,output,len) {return sym[0] + sym[1] + sym[2]},

    //Sparse Map Lookup
    lsm = (index, map) => {    if (map[0] == 0xFFFFFFFF) return map[index+1];    for (let i = 1, ind = 0, l = map.length, n = 0; i < l && ind <= index; i++) {        if (ind !== index) {            if ((n = map[i]) > -1) ind++;            else ind += -n;        } else return map[i];    }    return -1;},

    //State Action Functions
    state_funct = [(...v)=>((redn(4099,0,...v))),
()=>(58),
()=>(62),
(...v)=>(redv(5,R00_hydrocarbon,1,0,...v)),
(...v)=>((redn(55299,0,...v))),
()=>(78),
()=>(82),
()=>(86),
(...v)=>(redn(4103,1,...v)),
(...v)=>(redv(3079,R31_pre_preamble101_group_list,1,0,...v)),
(...v)=>(redn(2055,1,...v)),
(...v)=>(redn(5127,1,...v)),
()=>(98),
()=>(102),
()=>(94),
()=>(114),
()=>(106),
()=>(110),
()=>(118),
()=>(134),
()=>(130),
()=>(138),
()=>(142),
(...v)=>(redv(1035,R10_head,2,0,...v)),
(...v)=>(redv(55303,R540_prd_productions,1,0,...v)),
(...v)=>(redv(55303,R541_prd_productions,1,0,...v)),
()=>(182),
()=>(174),
()=>(178),
(...v)=>(redv(3083,R30_pre_preamble101_group_list,2,0,...v)),
()=>(222),
()=>(226),
()=>(230),
()=>(234),
()=>(270),
()=>(290),
()=>(322),
()=>(314),
()=>(326),
()=>(342),
()=>(338),
()=>(346),
(...v)=>(redv(20487,R200_cm_comment_data,1,0,...v)),
(...v)=>(redn(21511,1,...v)),
(...v)=>(redv(55307,R542_prd_productions,2,0,...v)),
(...v)=>(redv(55307,R00_hydrocarbon,2,0,...v)),
(...v)=>(redv(55307,R543_prd_productions,2,0,...v)),
(...v)=>(shftf(350,I551_prd_production,...v)),
(...v)=>(shftf(354,I553_prd_production,...v)),
()=>(358),
(...v)=>(redn(44039,1,...v)),
(...v)=>(redv(49159,R200_cm_comment_data,1,0,...v)),
()=>(374),
()=>(394),
()=>(398),
()=>(378),
()=>(382),
()=>(386),
()=>(390),
(...v)=>(redn(45063,1,...v)),
(...v)=>(shftf(402,I553_prd_production,...v)),
()=>(406),
()=>(410),
()=>(414),
(...v)=>(redn(27655,1,...v)),
(...v)=>(redv(26631,R31_pre_preamble101_group_list,1,0,...v)),
(...v)=>(redn(32775,1,...v)),
()=>(430),
()=>(434),
(...v)=>(redn(25607,1,...v)),
(...v)=>(redv(24583,R31_pre_preamble101_group_list,1,0,...v)),
(...v)=>(redn(28679,1,...v)),
()=>(450),
()=>(446),
(...v)=>(redn(31751,1,...v)),
()=>(454),
(...v)=>(redv(30727,R141_pre_import_preamble1802_group_list,1,0,...v)),
()=>(458),
(...v)=>(redn(33799,1,...v)),
(...v)=>(rednv(33799,C330_sym_terminal_symbol,1,0,...v)),
()=>(462),
()=>(466),
()=>(470),
()=>(478),
()=>(490),
(...v)=>(redv(12295,R31_pre_preamble101_group_list,1,0,...v)),
(...v)=>(redv(14343,R141_pre_import_preamble1802_group_list,1,0,...v)),
(...v)=>(redn(13319,1,...v)),
(...v)=>(rednv(18447,C180_cm_comment,3,0,...v)),
(...v)=>(redv(20491,R140_pre_import_preamble1802_group_list,2,0,...v)),
(...v)=>(redn(19463,1,...v)),
()=>(574),
()=>(558),
()=>(554),
()=>(570),
()=>(530),
()=>(566),
(...v)=>(redv(49163,R140_pre_import_preamble1802_group_list,2,0,...v)),
(...v)=>(redv(49163,R200_cm_comment_data,2,0,...v)),
(...v)=>(redv(47111,R141_pre_import_preamble1802_group_list,1,0,...v)),
(...v)=>(redn(46087,1,...v)),
(...v)=>(redn(48135,1,...v)),
()=>(606),
()=>(610),
()=>(614),
()=>(630),
(...v)=>((redn(71683,0,...v))),
(...v)=>(rednv(8211,C80_pre_ignore_preamble,4,0,...v)),
(...v)=>(redv(26635,R30_pre_preamble101_group_list,2,0,...v)),
(...v)=>(rednv(38923,C380_sym_generated_symbol,2,0,...v)),
(...v)=>(rednv(39947,C390_sym_literal_symbol,2,0,...v)),
(...v)=>(rednv(40971,C400_sym_escaped_symbol,2,0,...v)),
(...v)=>(rednv(6163,C60_pre_symbols_preamble,4,0,...v)),
(...v)=>(redv(24587,R30_pre_preamble101_group_list,2,0,...v)),
(...v)=>(redv(28683,R200_cm_comment_data,2,0,...v)),
(...v)=>(redn(29703,1,...v)),
(...v)=>(redv(30731,R140_pre_import_preamble1802_group_list,2,0,...v)),
()=>(634),
(...v)=>(rednv(10259,C100_pre_name_preamble,4,0,...v)),
(...v)=>(rednv(11283,C110_pre_ext_preamble,4,0,...v)),
(...v)=>(rednv(9235,C90_pre_error_preamble,4,0,...v)),
(...v)=>(redv(12299,R30_pre_preamble101_group_list,2,0,...v)),
()=>(646),
()=>(650),
()=>(654),
(...v)=>(redv(14347,R140_pre_import_preamble1802_group_list,2,0,...v)),
(...v)=>(redv(15367,R31_pre_preamble101_group_list,1,0,...v)),
(...v)=>(rednv(56339,C550_prd_production,4,0,...v)),
(...v)=>(shftf(658,I562_pb_production_bodies,...v)),
(...v)=>(redv(57351,R560_pb_production_bodies,1,0,...v)),
(...v)=>(rednv(58375,fn.body,1,0,...v)),
(...v)=>(rednv(59399,C585_pb_entries,1,0,...v)),
()=>(686),
(...v)=>(rednv(59399,C581_pb_entries,1,0,...v)),
(...v)=>(rednv(59399,C582_pb_entries,1,0,...v)),
(...v)=>(redv(60423,R590_pb_body_entries,1,0,...v)),
()=>(698),
()=>(702),
()=>(690),
(...v)=>(redn(35847,1,...v)),
()=>(714),
()=>(718),
()=>(722),
(...v)=>(rednv(35847,C330_sym_terminal_symbol,1,0,...v)),
(...v)=>(rednv(41991,C410_sym_production_symbol,1,0,...v)),
()=>(730),
()=>(726),
(...v)=>(rednv(37895,C370_sym_empty_symbol,1,0,...v)),
(...v)=>(rednv(36871,C360_sym_EOF_symbol,1,0,...v)),
(...v)=>(rednv(56339,C552_prd_production,4,0,...v)),
(...v)=>(rednv(43023,fn.importProduction,3,0,...v)),
(...v)=>(redv(49167,R140_pre_import_preamble1802_group_list,3,0,...v)),
(...v)=>(redv(47115,R140_pre_import_preamble1802_group_list,2,0,...v)),
(...v)=>(rednv(56339,C554_prd_production,4,0,...v)),
(...v)=>(rednv(62483,C610_fn_referenced_function,4,0,...v)),
(...v)=>(redv(54279,R200_cm_comment_data,1,0,...v)),
()=>(746),
()=>(762),
()=>(766),
()=>(750),
()=>(754),
()=>(758),
(...v)=>(redn(50183,1,...v)),
()=>(770),
(...v)=>(redn(71687,1,...v)),
(...v)=>(rednv(7191,C70_pre_precedence_preamble,5,0,...v)),
(...v)=>(redv(15371,R30_pre_preamble101_group_list,2,0,...v)),
(...v)=>(redn(16391,1,...v)),
(...v)=>(redv(57355,R200_cm_comment_data,2,0,...v)),
(...v)=>(rednv(59403,C584_pb_entries,2,0,...v)),
()=>(798),
(...v)=>(rednv(59403,C583_pb_entries,2,0,...v)),
(...v)=>(redv(60427,R591_pb_body_entries,2,0,...v)),
()=>(838),
()=>(842),
()=>(822),
()=>(826),
()=>(830),
()=>(834),
(...v)=>(redv(35851,R350_sym_symbol,2,0,...v)),
()=>(850),
(...v)=>(redn(34823,1,...v)),
()=>(854),
()=>(858),
(...v)=>(redv(54283,R140_pre_import_preamble1802_group_list,2,0,...v)),
(...v)=>(redv(54283,R200_cm_comment_data,2,0,...v)),
(...v)=>(redv(52231,R141_pre_import_preamble1802_group_list,1,0,...v)),
(...v)=>(redn(51207,1,...v)),
(...v)=>(redn(53255,1,...v)),
(...v)=>(rednv(62487,C611_fn_referenced_function,5,0,...v)),
(...v)=>(redv(71691,R140_pre_import_preamble1802_group_list,2,0,...v)),
()=>(898),
()=>(906),
(...v)=>(redv(57359,R561_pb_production_bodies,3,0,...v)),
(...v)=>(rednv(59407,C580_pb_entries,3,0,...v)),
()=>(910),
()=>(914),
()=>(918),
()=>(922),
()=>(926),
(...v)=>(redn(67591,1,...v)),
(...v)=>(redn(66567,1,...v)),
(...v)=>(redn(68615,1,...v)),
(...v)=>(redn(64519,1,...v)),
(...v)=>(redn(63495,1,...v)),
()=>(930),
(...v)=>(rednv(35855,fn.listProduction,3,0,...v)),
(...v)=>(redv(60431,R592_pb_body_entries,3,0,...v)),
(...v)=>(rednv(35855,fn.groupProduction,3,0,...v)),
()=>(934),
(...v)=>(redn(23559,1,...v)),
(...v)=>(redv(22535,R31_pre_preamble101_group_list,1,0,...v)),
()=>(942),
()=>(946),
()=>(950),
(...v)=>(rednv(70671,C691_fn_function_clause,3,0,...v)),
(...v)=>(redv(54287,R140_pre_import_preamble1802_group_list,3,0,...v)),
(...v)=>(redv(52235,R140_pre_import_preamble1802_group_list,2,0,...v)),
(...v)=>(redv(72719,R710_fn_js_data_block,3,0,...v)),
()=>(954),
(...v)=>(redv(17439,fn.importData,7,0,...v)),
(...v)=>(rednv(35859,fn.listProduction,4,0,...v)),
(...v)=>(rednv(61459,C600_pb_condition_clause,4,0,...v)),
(...v)=>(redv(22539,R30_pre_preamble101_group_list,2,0,...v)),
(...v)=>(rednv(61459,C601_pb_condition_clause,4,0,...v)),
(...v)=>(rednv(61459,C602_pb_condition_clause,4,0,...v)),
(...v)=>(rednv(70675,C690_fn_function_clause,4,0,...v)),
(...v)=>(redv(17443,fn.importData,8,0,...v)),
()=>(978),
(...v)=>(rednv(69651,C681_fn_reduce_function,4,0,...v)),
(...v)=>(rednv(69651,C682_fn_reduce_function,4,0,...v)),
()=>(982),
(...v)=>(rednv(65555,C641_fn_error_function,4,0,...v)),
(...v)=>(rednv(69655,C680_fn_reduce_function,5,0,...v)),
(...v)=>(rednv(65559,C640_fn_error_function,5,0,...v))],

    //Goto Lookup Functions
    goto = [v=>lsm(v,gt0),
nf,
v=>lsm(v,gt1),
v=>lsm(v,gt2),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt3),
v=>lsm(v,gt4),
nf,
nf,
v=>lsm(v,gt5),
v=>lsm(v,gt6),
v=>lsm(v,gt7),
nf,
v=>lsm(v,gt8),
v=>lsm(v,gt9),
v=>lsm(v,gt10),
v=>lsm(v,gt11),
v=>lsm(v,gt12),
v=>lsm(v,gt13),
v=>lsm(v,gt14),
v=>lsm(v,gt15),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt16),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt17),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt18),
v=>lsm(v,gt19),
nf,
nf,
v=>lsm(v,gt20),
nf,
nf,
nf,
nf,
v=>lsm(v,gt21),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt22),
nf,
nf,
v=>lsm(v,gt23),
v=>lsm(v,gt24),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt25),
v=>lsm(v,gt26),
v=>lsm(v,gt27),
v=>lsm(v,gt28),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt29),
v=>lsm(v,gt30),
v=>lsm(v,gt31),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt32),
nf,
v=>lsm(v,gt33),
nf,
nf,
v=>lsm(v,gt34),
nf,
nf,
v=>lsm(v,gt35),
nf,
nf,
v=>lsm(v,gt36),
nf,
nf,
v=>lsm(v,gt37),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt38),
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt34),
nf,
nf,
nf,
v=>lsm(v,gt34),
nf,
v=>lsm(v,gt39),
nf,
nf,
nf,
v=>lsm(v,gt40),
v=>lsm(v,gt22),
nf,
v=>lsm(v,gt41),
nf,
v=>lsm(v,gt42),
v=>lsm(v,gt43),
nf,
nf,
nf,
v=>lsm(v,gt44),
nf,
v=>lsm(v,gt45),
nf,
nf,
nf,
v=>lsm(v,gt36),
v=>lsm(v,gt46),
nf,
v=>lsm(v,gt47),
nf,
nf,
v=>lsm(v,gt48),
v=>lsm(v,gt34),
v=>lsm(v,gt49),
v=>lsm(v,gt50),
v=>lsm(v,gt51),
v=>lsm(v,gt52),
v=>lsm(v,gt53),
v=>lsm(v,gt54),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt40),
v=>lsm(v,gt40),
v=>lsm(v,gt55),
nf,
nf,
nf,
v=>lsm(v,gt56),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt57),
nf,
nf,
nf,
v=>lsm(v,gt40),
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt58),
v=>lsm(v,gt59),
v=>lsm(v,gt60),
v=>lsm(v,gt61),
v=>lsm(v,gt62),
nf,
nf,
nf,
nf,
nf,
nf,
nf,
v=>lsm(v,gt40),
nf,
nf,
v=>lsm(v,gt40),
nf,
nf,
nf];

function getToken(l, SYM_LU) {
    if (l.END) return 0; /*13*/

    switch (l.ty) {
        case 2:
            if (SYM_LU.has(l.tx)) return SYM_LU.get(l.tx);
            return 2;
        case 1:
            return 1;
        case 4:
            return 3;
        case 256:
            return 9;
        case 8:
            return 4;
        case 512:
            return 10;
        default:
            return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);
    }
}

/************ Parser *************/

function parser(l, e = {}) {
    
    fn = e.functions;

    l.IWS = false;
    l.PARSE_STRING = true;

    if (symbols.length > 0) {
        symbols.forEach(s => { l.addSymbol(s) });
        l.tl = 0;
        l.next();
    }

    const o = [],
        ss = [0, 0];

    let time = 1000000,
        RECOVERING = 100,
        tk = getToken(l, lu),
        p = l.copy(),
        sp = 1,
        len = 0,
        off = 0,
        reduceStack = (e.reduceStack = []);


    outer:

        while (time-- > 0) {

            const fn = lsm(tk, state[ss[sp]]) || 0;


            /*@*/// console.log({end:l.END, state:ss[sp], tx:l.tx, ty:l.ty, tk:tk, rev:rlu.get(tk), s_map:state[ss[sp]], res:lsm(tk, state[ss[sp]])});

            let r,
                gt = -1;

            if (fn == 0) {
                /*Ignore the token*/
                l.next();
                tk = getToken(l, lu);
                continue;
            }

            if (fn > 0) {
                r = state_funct[fn - 1](tk, e, o, l, ss[sp - 1]);
            } else {
                
                if(l.ty == 8 && l.tl > 1){ 
                    // Make sure that special tokens are not getting in the way
                    l.tl = 0;
                    // This will skip the generation of a custom symbol
                    l.next(l, false);

                    if(l.tl == 0)
                        continue;
                }

                if (RECOVERING > 1 && !l.END) {

                    if (tk !== lu.get(l.ty)) {
                        //console.log("ABLE", rlu.get(tk), l.tx, tk )
                        tk = lu.get(l.ty);
                        continue;
                    }

                    if (tk !== 13) {
                        //console.log("MABLE")
                        tk = 13;
                        RECOVERING = 1;
                        continue;
                    }
                }

                tk = getToken(l, lu);

                const recovery_token = eh[ss[sp]](tk, e, o, l, p, ss[sp], (lex)=>getToken(lex, lu));

                if (RECOVERING > 0 && recovery_token >= 0) {
                    RECOVERING = -1; /* To prevent infinite recursion */
                    tk = recovery_token;
                    l.tl = 0; /*reset current token */
                    continue;
                }
            }

            switch (r & 3) {
                case 0:
                    /* ERROR */

                    if (tk == "$eof")
                        l.throw("Unexpected end of input");
                    l.throw(`Unexpected token [${RECOVERING ? l.next().tx : l.tx}]`);
                    return [null];

                case 1:
                    /* ACCEPT */
                    break outer;

                case 2:
                    /*SHIFT */
                    o.push(l.tx);
                    ss.push(off, r >> 2);
                    sp += 2;
                    p.sync(l);
                    l.next();
                    off = l.off;
                    tk = getToken(l, lu);
                    RECOVERING++;
                    break;

                case 3:
                    /* REDUCE */

                    len = (r & 0x3FC) >> 1;

                    ss.length -= len;
                    sp -= len;
                    gt = goto[ss[sp]](r >> 10);

                    if (gt < 0)
                        l.throw("Invalid state reached!");

                    if(reduceStack.length > 0){
                        let i = reduceStack.length -1;
                        while(i > -1){
                            let item = reduceStack[i--];

                            if(item.index == sp){
                                item.action(output)
                            }else if(item.index > sp){
                                reduceStack.length--;
                            }else{
                                break;
                            }
                        }
                    }

                    ss.push(off, gt);
                    sp += 2;
                    break;
            }
        }
    return o[0];
}; export default parser;