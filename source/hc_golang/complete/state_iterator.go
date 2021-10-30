package hc_recognizer

import hc_recognizer "candlelib/hc_recognizer"

// Kernel State Iterator -------------------
type KernelStateIterator struct {
	current     *hc_recognizer.KernelState
	refs        []*hc_recognizer.KernelState
	index       uint32
	final_index uint32
	valid       bool
}

func newKernelStateIterator(state *hc_recognizer.KernelState) *KernelStateIterator {

	iter := KernelStateIterator{}

	active := state

	iter.refs = append(iter.refs, active)

	for active.P_origin != nil {
		active = active.P_origin
		iter.refs = append(iter.refs, active)
	}

	last := iter.refs[len(iter.refs)-1]

	iter.refs = iter.refs[0 : len(iter.refs)-1]

	iter.current = last

	if len(iter.refs) > 0 {
		iter.final_index = iter.refs[len(iter.refs)-1].P_origin_fork
	} else {
		iter.final_index = last.P_get_rules_len()
	}

	iter.index = 0

	iter.valid = true

	return &iter
}

func (iter *KernelStateIterator) is_valid() bool {
	return iter.valid
}

func (iter *KernelStateIterator) next() uint16 {

	if iter.index >= iter.final_index {

		if len(iter.refs) > 0 {

			last := iter.refs[len(iter.refs)-1]

			iter.refs = iter.refs[0 : len(iter.refs)-1]

			iter.index = 0

			if len(iter.refs) > 0 {
				iter.final_index = iter.refs[len(iter.refs)-1].P_origin_fork
			} else {
				iter.final_index = last.P_get_rules_len()
			}

			iter.current = last
		} else {
			iter.valid = false
			return 0
		}
	}

	ret_val := iter.current.P_rules[iter.index]

	iter.index += 1

	return ret_val
}
