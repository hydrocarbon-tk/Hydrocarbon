import { parser_factory } from "../source/parsers/parser.js";
import { renderSkribbleRecognizer } from "../build/library/render/skribble_recognizer_template.js"



const recognizer_template = renderSkribbleRecognizer()


assert( recognizer_template == 3 );
