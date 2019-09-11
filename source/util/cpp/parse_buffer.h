#pragma once
#include <stdlib.h>

enum class ParseErrorCode : int
{
    InvalidToken = 10001,
    ErrorStateReached = 10002,
    InvalidGotoState = 10003,
    UnexpectedEndOfOutput = 10004,
    CannotAllocateBuffer = 10005,
    CannotAllocateSpace = 10006,
    MaxStatePointerReached = 10007
};

/*
	Provides a buffer to hold output data from parser.
	Allows the instantaneous freeing of all parse result data
	provided that all objects were allocated through this mechanism.
*/
template <class T>
class ParseBuffer
{
private:
	char * watch = nullptr;
	char * buffer = nullptr;
	T * root_object = nullptr;

	unsigned allocation_pointer = 0;
	unsigned size = 0;
public:

	ParseBuffer(size_t s): size(s) {

		watch = new char(1);

		if (size == 0)
			buffer = nullptr;
		else
			buffer = (char *)malloc(size);

		if (!buffer)
			throw ParseErrorCode::CannotAllocateBuffer;
	}

	ParseBuffer(ParseBuffer& b) {
		watch = b.watch;
		buffer = b.buffer;
		root_object = b.root_object;
		allocation_pointer = b.allocation_pointer;
		size = b.size;

		(*watch)++;
	};

	~ParseBuffer() {
		if ((--(*watch)) <= 0) {
			//Not removing root_object since this SHOULD be a pointer to a location within buffer.
			delete watch;
			free(buffer);
		}
	};

	void * alloc(size_t s) {
		if (allocation_pointer + s < size) {
			unsigned temp = allocation_pointer;
			allocation_pointer += s;
			return (buffer + temp);
		} else
			return nullptr;
	};

	void dealloc(void * ptr) noexcept {};

	T* getRootObject() {
		return root_object;
	};

	void setRootObject(void * ptr) {
		root_object = (T*) ptr;
	};
};


template <class T>
inline void * operator new(size_t s, ParseBuffer<T>& buffer)
{

	return buffer.alloc(s);
}

template <class T>
void operator delete(void * ptr, ParseBuffer<T>& buffer)
{
	buffer.dealloc(ptr);
}
