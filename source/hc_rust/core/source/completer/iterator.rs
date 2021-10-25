// ///////////////////////////////////////////
// PARSER STATE ITERATOR
// ///////////////////////////////////////////
use super::super::kernel::state::KernelState;
use std::iter::Iterator;

pub struct KernelStateIterator<'a> {
    current: Option<&'a KernelState>,
    refs: Vec<&'a KernelState>,
    index: usize,
    final_index: usize,
}

impl KernelStateIterator<'_> {
    pub fn new<'a>(state: &'a KernelState) -> KernelStateIterator {
        let mut active = state;
        let mut vector: Vec<&'a KernelState> = Vec::new();

        vector.push(state);

        unsafe {
            while let Some(a) = active.origin.as_ref() {
                vector.push(a);
                active = a;
            }
        }

        let last = vector.pop();

        return KernelStateIterator {
            final_index: if let Some(a) = vector.last() {
                a.origin_fork as usize
            } else if let Some(a) = last {
                a.get_rules_len() as usize
            } else {
                0
            },
            index: 0,
            refs: vector,
            current: last,
        };
    }
}

impl Iterator for KernelStateIterator<'_> {
    type Item = u16;

    fn next(&mut self) -> Option<Self::Item> {
        if let Some(current) = self.current {
            if self.index >= self.final_index {
                if let Some(next) = self.refs.pop() {
                    self.index = 0;
                    self.final_index = if let Some(a) = self.refs.last() {
                        a.origin_fork as usize
                    } else {
                        next.get_rules_len() as usize
                    };
                    self.current = Some(next);
                } else {
                    return None;
                }

                return Self::next(self);
            }

            let val = current.rules[self.index];

            self.index += 1;

            return Some(val);
        }

        None
    }
}
