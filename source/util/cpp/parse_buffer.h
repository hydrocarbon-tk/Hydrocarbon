
#pragma once
#include "parse_error_codes.h"
#include <iostream>
#include <stdlib.h>
#include <string>

template <class T>
class ParseBuffer;

template <class T>
struct BufferData {

    BufferData<T> * prev_buffer = nullptr;
    ParseBuffer<T> * last       = nullptr;
    void * root_object          = nullptr;
    unsigned size               = 0;
    unsigned allocation_pointer = 0;

    void copy(const BufferData & other) {
        prev_buffer        = other.prev_buffer;
        last               = other.last;
        allocation_pointer = other.allocation_pointer;
        root_object        = other.root_object;
        size               = other.size;
    }

    void destroy() {
        if (prev_buffer)
            prev_buffer->destroy();
        free((void *) this);
    }

    inline void initialize() {
        prev_buffer        = nullptr;
        last               = nullptr;
        root_object        = nullptr;
        size               = 0;
        allocation_pointer = 0;
    }
};

/*
	Provides a buffer to hold data outputed from parser.
	Allows the instantaneous freeing of all parse data
	provided that all objects were allocated through this mechanism.
*/
template <class T>
class ParseBuffer {


  public:
    typedef BufferData<T> BufferData;
    typedef size_t size_type;
    typedef ptrdiff_t difference_type;
    typedef T * pointer;
    typedef const T * const_pointer;
    typedef T & reference;
    typedef const T & const_reference;
    typedef T value_type;
    //private:

    void * buffer      = nullptr;
    ParseBuffer * prev = nullptr;

    /*
	 * Creates new buffer.
	 * Frees old buffer.
	 * Updates all linked ParseBuffers with new values.
	 * Returns false if any of the above fails.
	 */
    bool createBuffer(size_t s) {

        void * b = malloc(s);

        if (b) {
            BufferData & bd_new = *(BufferData *) b;

            bd_new.initialize();

            if (buffer) {
                memcpy(b, buffer, sizeof(BufferData));
                BufferData & bd_old = *(BufferData *) buffer;
                bd_new.copy(bd_old);
                bd_new.prev_buffer = &bd_old;
            } else {
                bd_new.root_object = nullptr;
                bd_new.last        = this;
                bd_new.prev_buffer = nullptr;
            }

            bd_new.allocation_pointer = sizeof(BufferData);
            bd_new.size               = s;

            ParseBuffer * pb = bd_new.last;

            while (pb) {
                pb->buffer = b;
                pb         = pb->prev;
            }

            return true;
        }

        return false;
    }

  public:
    ParseBuffer() {
        createBuffer(128);
    }

    ParseBuffer(size_t s) {
        if (s == 0)
            buffer = nullptr;
        else {
            createBuffer(s);
        }
    }

    ParseBuffer(const ParseBuffer & b) {
        buffer = b.buffer;

        BufferData & bd = *(BufferData *) buffer;

        prev = bd.last;

        bd.last = this;
    };

    template <class U>
    ParseBuffer(const ParseBuffer<U> & b) {
        buffer = b.buffer;

        BufferData & bd = *(BufferData *) buffer;

        prev = bd.last;

        bd.last = this;
    };

    ~ParseBuffer() {

        BufferData & bd = *(BufferData *) buffer;

        ParseBuffer * pb = bd.last;

        if (pb == this)
            bd.last = prev;

        if (!prev) {
            bd.destroy();
            return;
        }

        while (pb->prev) {
            if (pb->prev == this) {
                pb->prev = prev;
                break;
            }
            pb = pb->prev;
        }
    };

    pointer allocate(size_type n, const void * = 0) {
        return (T *) alloc(n * sizeof(T));
    }

    void deallocate(void * p, size_type) { dealloc(p); }

    pointer address(reference x) const { return &x; }

    const_pointer address(const_reference x) const { return &x; }

    ParseBuffer<T> & operator=(const ParseBuffer &) { return *this; }

    void construct(pointer p, const T & val) { new ((T *) p) T(val); }

    void destroy(pointer p) { p->~T(); }

    void * alloc(size_t s) {
        BufferData & bd = *(BufferData *) buffer;

        if (buffer && (bd.allocation_pointer) + s < (bd.size)) {
            unsigned temp = bd.allocation_pointer;
            bd.allocation_pointer += s;
            return ((char *) buffer + temp);

            //Try to create new buffer and move data to the new one.
        } else if (createBuffer((bd.size) << 1)) //New buffer will be twice size
            return alloc(s);

        return nullptr;
    };

    void dealloc(void * ptr) noexcept {/* Empty Functions - All Data is freed at once when the last ParseBuffer is destroyed. */};

    template <class A>
    A * getRootObject() {
        BufferData & bd = *(BufferData *) buffer;
        return (A *) bd.root_object;
    };

    void setRootObject(void * ptr) {
        BufferData & bd = *(BufferData *) buffer;
        bd.root_object  = ptr;
    };

    size_type max_size() const { return size_t(-1); }

    template <class U>
    struct rebind { typedef ParseBuffer<U> other; };

    template <class U>
    ParseBuffer & operator=(const ParseBuffer<U> &) { return *this; }

    template <class U>
    bool operator==(const ParseBuffer<U> & b) const {
        return b.buffer == buffer;
    }

    template <class U>
    bool operator!=(const ParseBuffer<U> & b) const {
        return b.buffer != buffer;
    }
};

typedef ParseBuffer<char> ParseBuffera;

inline void * operator new(size_t s, ParseBuffera & buffer) {
    return buffer.alloc(s);
}

inline void operator delete(void * ptr, ParseBuffera & buffer) {
    buffer.dealloc(ptr);
}
