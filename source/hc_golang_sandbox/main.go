package main

import (
	"candlelib/hc_kernel"
	"candlelib/hc_recognizer"
	"log"
	"time"
)

var instructions = []uint32{0, 4026531840, 2164260864, 4026531841, 67108864, 1,
	2835349513, 0, 65539, 2155872296, 2147496047, 2147489908,
	603979884, 603979806, 0, 603979884, 603979808, 0,
	603979884, 603979878, 0, 2826960899, 0, 1,
	2147483655, 603979884, 603979880, 0, 4026531840, 0,
	603980837, 0, 2835349507, 0, 1, 2147483764,
	268435456, 603979816, 0, 4026531840, 2835349508, 0,
	65538, 2147483752, 2147487863, 603979826, 0, 603979860,
	0, 4026531840, 2835349507, 0, 1, 2147483752,
	268435456, 603979834, 0, 4026531840, 2835349507, 0,
	1, 2147483762, 268435456, 603979842, 0, 4026531840,
	2835349507, 0, 1, 2147483749, 268435456, 603979850,
	0, 4026531840, 2835349507, 0, 1, 2147483749,
	268435456, 603979858, 0, 4026531840, 805306383, 0,
	2835349507, 0, 1, 2147483767, 268435456, 603979868,
	0, 4026531840, 2835349507, 0, 1, 2147483759,
	268435456, 603979876, 0, 4026531840, 805306386, 0,
	603980887, 0, 603980663, 0, 805306387, 0,
	2818572314, 0, 131078, 2168475663, 2160097293, 2147483666,
	2134941699, 2147493905, 2147534867, 1476395009, 18, 603979884,
	603979882, 0, 1476395009, 17, 603979884, 603979882,
	0, 1476395009, 15, 603979884, 603979882, 0,
	1476395009, 13, 603979884, 603979882, 0, 1476395009,
	9999, 603979884, 603979882, 0, 0, 4026531840,
	2835349507, 0, 1, 2147483764, 603979938, 603979936,
	0, 2826960899, 0, 1, 2147483655, 603979938,
	603979880, 0, 4026531840, 0, 603980916, 0,
	2818572299, 0, 65539, 2147483666, 2151688195, 2147504147,
	1476395009, 18, 603979938, 603979882, 0, 1476395009,
	9999, 603979938, 603979882, 0, 0, 4026531840,
	2835349519, 0, 131077, 2147483693, 2143301673, 2147508266,
	2151684139, 2147502127, 603979998, 603979988, 0, 603979998,
	603979990, 0, 603979998, 603979992, 0, 603979998,
	603979994, 0, 603979998, 603979996, 0, 2826960899,
	0, 1, 2147483655, 603979998, 603979880, 0,
	4026531840, 0, 603980798, 0, 603980811, 0,
	603980850, 0, 603980824, 0, 603980874, 0,
	2818572319, 0, 131079, 2168475660, 2168485899, 2155913226,
	2139146243, 2147493902, 2147483664, 2147545107, 1476395009, 16,
	603979998, 603979882, 0, 1476395009, 14, 603979998,
	603979882, 0, 1476395009, 12, 603979998, 603979882,
	0, 1476395009, 11, 603979998, 603979882, 0,
	1476395009, 10, 603979998, 603979882, 0, 1476395009,
	9999, 603979998, 603979882, 0, 0, 4026531840,
	2835349513, 0, 65539, 2155878443, 2143301673, 2147483693,
	603980064, 603979988, 0, 603980064, 603979990, 0,
	603980064, 603979992, 0, 2826960899, 0, 1,
	2147483655, 603980064, 603979880, 0, 4026531840, 0,
	2818572309, 0, 131077, 2164271115, 2147483662, 2143309834,
	2134931459, 2147524627, 1476395009, 14, 603980064, 603979882,
	0, 1476395009, 11, 603980064, 603979882, 0,
	1476395009, 10, 603980064, 603979882, 0, 1476395009,
	9999, 603980064, 603979882, 0, 0, 4026531840,
	2835349507, 0, 1, 2147483695, 603980110, 603979994,
	0, 2826960899, 0, 1, 2147483655, 603980110,
	603979880, 0, 4026531840, 0, 2818572299, 0,
	65539, 2147483660, 2151688195, 2147504147, 1476395009, 12,
	603980110, 603979882, 0, 1476395009, 9999, 603980110,
	603979882, 0, 0, 4026531840, 2835349507, 0,
	1, 2147483690, 603980144, 603979996, 0, 2826960899,
	0, 1, 2147483655, 603980144, 603979880, 0,
	4026531840, 0, 2818572299, 0, 65539, 2147483664,
	2151688195, 2147504147, 1476395009, 16, 603980144, 603979882,
	0, 1476395009, 9999, 603980144, 603979882, 0,
	0, 4026531840, 2835349510, 0, 65538, 2147483693,
	2143295531, 603980182, 603979988, 0, 603980182, 603979990,
	0, 2826960899, 0, 1, 2147483655, 603980182,
	603979880, 0, 4026531840, 0, 2818572304, 0,
	131076, 2151677963, 2147514387, 2147493898, 2134921219, 1476395009,
	11, 603980182, 603979882, 0, 1476395009, 10,
	603980182, 603979882, 0, 1476395009, 9999, 603980182,
	603979882, 0, 0, 4026531840, 2835349507, 0,
	1, 2147483693, 603980222, 603979988, 0, 2826960899,
	0, 1, 2147483655, 603980222, 603979880, 0,
	4026531840, 0, 2818572299, 0, 65539, 2147483658,
	2151688195, 2147504147, 1476395009, 10, 603980222, 603979882,
	0, 1476395009, 9999, 603980222, 603979882, 0,
	0, 4026531840, 2835349507, 0, 1, 2147483691,
	603980256, 603979990, 0, 2826960899, 0, 1,
	2147483655, 603980256, 603979880, 0, 4026531840, 0,
	2818572299, 0, 65539, 2155872267, 2143299587, 2147504147,
	1476395009, 11, 603980256, 603979882, 0, 1476395009,
	9999, 603980256, 603979882, 0, 0, 4026531840,
	2835349507, 0, 1, 2147483688, 603980290, 603979806,
	0, 2826960899, 0, 1, 2147483655, 603980290,
	603979880, 0, 4026531840, 0, 2818572299, 0,
	65539, 2155872269, 2143299587, 2147504147, 1476395009, 13,
	603980290, 603979882, 0, 1476395009, 9999, 603980290,
	603979882, 0, 0, 4026531840, 2835349507, 0,
	1, 2147483689, 603980324, 603979992, 0, 2826960899,
	0, 1, 2147483655, 603980324, 603979880, 0,
	4026531840, 0, 2818572299, 0, 65539, 2147483662,
	2151688195, 2147504147, 1476395009, 14, 603980324, 603979882,
	0, 1476395009, 9999, 603980324, 603979882, 0,
	0, 4026531840, 2835349507, 0, 1, 2147483764,
	603980360, 603980358, 0, 2826960899, 0, 1,
	2147483655, 603980360, 603979880, 0, 4026531840, 0,
	603980863, 0, 2818572299, 0, 65539, 2155872271,
	2143299587, 2147504147, 1476395009, 15, 603980360, 603979882,
	0, 1476395009, 9999, 603980360, 603979882, 0,
	0, 4026531840, 2835349507, 0, 1, 2147483759,
	603980394, 603979878, 0, 2826960899, 0, 1,
	2147483655, 603980394, 603979880, 0, 4026531840, 0,
	2818572299, 0, 65539, 2155872273, 2143299587, 2147504147,
	1476395009, 17, 603980394, 603979882, 0, 1476395009,
	9999, 603980394, 603979882, 0, 0, 4026531840,
	2822766604, 67108870, 131076, 2147495953, 2143289357, 2147502098,
	2147489807, 637534936, 603980432, 0, 637534936, 603980432,
	0, 637534936, 603980432, 0, 637534936, 603980432,
	0, 4026531840, 603980569, 0, 2822766596, 67109044,
	65538, 2151677964, 2147487760, 603980448, 0, 603980462,
	0, 603980446, 0, 0, 805306369, 0,
	2822766595, 67109182, 1, 2147483660, 268435456, 603980456,
	0, 4026531840, 603980459, 603980569, 0, 1073742104,
	805306370, 0, 2822766595, 67109216, 1, 2147483664,
	268435456, 603980456, 0, 4026531840, 2554331146, 67109250,
	131074, 603980480, 0, 603980482, 0, 603980496,
	0, 0, 805306368, 0, 2822766595, 67109294,
	1, 2147483658, 268435456, 603980490, 0, 4026531840,
	603980493, 603980569, 0, 1073742104, 805306369, 0,
	2822766595, 67109328, 1, 2147483659, 268435456, 603980490,
	0, 4026531840, 2818572295, 0, 65539, 2155884544,
	2147489793, 2147483650, 637534936, 603980434, 0, 637534936,
	603980470, 0, 0, 4026531840, 2822766604, 67108870,
	131076, 2147495953, 2143289357, 2147502098, 2147489807, 637534982,
	603980432, 0, 637534982, 603980432, 0, 637534982,
	603980432, 0, 637534982, 603980432, 0, 4026531840,
	2822766597, 67109128, 65539, 2155872266, 2147487755, 2147491854,
	603980482, 0, 603980496, 0, 4026531840, 4026531840,
	3120562963, 2550136833, 0, 131075, 4026531840, 0,
	0, 637534982, 603980538, 0, 637534982, 603980434,
	0, 2550136833, 0, 65537, 4026531840, 0,
	0, 2822766604, 67108870, 131076, 2147495953, 2143289357,
	2147502098, 2147489807, 637535080, 603980589, 0, 637535080,
	603980611, 0, 637535080, 603980622, 0, 637535080,
	603980630, 0, 4026531840, 2822766595, 67109362, 1,
	2147483661, 268435456, 603980597, 0, 4026531840, 603980600,
	603980518, 0, 2822766595, 67109396, 1, 2147483662,
	268435456, 603980608, 0, 4026531840, 1073742360, 805306370,
	0, 2822766595, 67109430, 1, 2147483663, 268435456,
	603980619, 0, 4026531840, 1073742600, 805306370, 0,
	2822766595, 67109466, 1, 2147483665, 268435456, 603980619,
	0, 4026531840, 2822766595, 67109008, 1, 2147483666,
	268435456, 603980619, 0, 4026531840, 2822766596, 67109044,
	65538, 2151677964, 2147487760, 603980448, 0, 603980462,
	0, 4026531840, 3120563057, 2818572291, 0, 1,
	2147483650, 637535080, 603980638, 0, 4026531840, 2550136834,
	0, 65537, 4026531840, 0, 0, 2826960900,
	0, 1, 2147483655, 268435456, 637535107, 603980673,
	0, 4026531840, 0, 805306371, 0, 0,
	2826960900, 0, 1, 2147483651, 268435456, 637535120,
	603980686, 0, 4026531840, 0, 805306372, 0,
	0, 2826960900, 0, 1, 2147483650, 268435456,
	637535133, 603980699, 0, 4026531840, 0, 805306373,
	0, 0, 2826960900, 0, 1, 2147483654,
	268435456, 637535146, 603980712, 0, 4026531840, 0,
	805306374, 0, 0, 2826960900, 0, 1,
	2147483653, 268435456, 637535159, 603980725, 0, 4026531840,
	0, 805306375, 0, 0, 2826960900, 0,
	1, 2147483653, 268435456, 637535180, 603980738, 0,
	4026531840, 0, 2826960899, 0, 1, 2147483653,
	268435456, 603980746, 0, 4026531840, 805306376, 0,
	3120563157, 2818572291, 0, 1, 2147483656, 637535180,
	603980738, 0, 4026531840, 2550136840, 0, 65537,
	4026531840, 0, 0, 2826960900, 0, 1,
	2147483651, 268435456, 637535215, 603980773, 0, 4026531840,
	0, 2826960899, 0, 1, 2147483651, 268435456,
	603980781, 0, 4026531840, 805306377, 0, 3120563192,
	2818572291, 0, 1, 2147483657, 637535215, 603980773,
	0, 4026531840, 2550136841, 0, 65537, 4026531840,
	0, 0, 2835349508, 0, 1, 2147483693,
	268435456, 637535242, 603980808, 0, 4026531840, 0,
	805306378, 0, 0, 2835349508, 0, 1,
	2147483691, 268435456, 637535255, 603980821, 0, 4026531840,
	0, 805306379, 0, 0, 2835349508, 0,
	1, 2147483695, 268435456, 637535268, 603980834, 0,
	4026531840, 0, 805306380, 0, 0, 2835349508,
	0, 1, 2147483688, 268435456, 637535281, 603980847,
	0, 4026531840, 0, 805306381, 0, 0,
	2835349508, 0, 1, 2147483689, 268435456, 637535294,
	603980860, 0, 4026531840, 0, 805306382, 0,
	0, 2835349508, 0, 1, 2147483764, 268435456,
	637535305, 603979826, 0, 4026531840, 0, 0,
	2835349508, 0, 1, 2147483690, 268435456, 637535318,
	603980884, 0, 4026531840, 0, 805306384, 0,
	0, 2835349508, 0, 1, 2147483759, 268435456,
	637535347, 603980897, 0, 4026531840, 0, 2835349507,
	0, 1, 2147483758, 268435456, 603980905, 0,
	4026531840, 2835349507, 0, 1, 2147483749, 268435456,
	603980913, 0, 4026531840, 805306385, 0, 0,
	2835349508, 0, 1, 2147483764, 268435456, 637535358,
	603979860, 0, 4026531840, 0, 0}

func main() {

	input := []uint8("two + three")

	hc_kernel.Init()

	valid, invalid := hc_kernel.Run(&instructions, &input, 67109500)

	start := time.Now()

	hc_recognizer.Complete(
		&input,
		valid,
		invalid,
	)
	elapsed := time.Since(start)
	log.Printf("Parse took %s", elapsed)
}