#pragma once

#include <algorithm>

template <const int tSize>
struct OptionalNodesBase {
	OptionalNodesBase(int bitfield, int output_offset, void ** output) {

		void ** data = (void **) this;

		for (int j = 0; j < tSize; j++)
			data[j] = (bitfield & (1 << j)) ? output[output_offset++] : nullptr;
	}
};

template<class ... > struct OptionalNodes {};

template<class A>
struct OptionalNodes<A> : public OptionalNodesBase<1> {
	__declspec(align(8)) A a;
	OptionalNodes<A>(int a, int b, void ** c) : OptionalNodesBase<1>(a,b,c) {};
};

template<class A, class B>
struct OptionalNodes<A, B> : public OptionalNodesBase<2> {
	__declspec(align(8)) A a;
	__declspec(align(8)) B b;
	OptionalNodes<A, B>(int a, int b, void ** c) : OptionalNodesBase<2>(a,b,c) {};
};

template<class A, class B, class C>
struct OptionalNodes<A, B, C> : public OptionalNodesBase<3> {
	__declspec(align(8)) A a;
	__declspec(align(8)) B b;
	__declspec(align(8)) C c;
	OptionalNodes<A, B, C>(int a, int b, void ** c) : OptionalNodesBase<3>(a,b,c) {};
};


template<class A, class B, class C, class D>
struct OptionalNodes<A, B, C, D> : public OptionalNodesBase<4> {
	__declspec(align(8)) A a;
	__declspec(align(8)) B b;
	__declspec(align(8)) C c;
	__declspec(align(8)) D d;
	OptionalNodes<A, B, C, D>(int a, int b, void ** c) : OptionalNodesBase<4>(a,b,c) {};
};

template<class A, class B, class C, class D, class E>
struct OptionalNodes<A, B, C, D, E> : public OptionalNodesBase<5> {
	__declspec(align(8)) A a;
	__declspec(align(8)) B b;
	__declspec(align(8)) C c;
	__declspec(align(8)) D d;
	__declspec(align(8)) E e;
	OptionalNodes<A, B, C, D, E>(int a, int b, void ** c) : OptionalNodesBase<5>(a,b,c) {};
};

template<class A, class B, class C, class D, class E, class F>
struct OptionalNodes<A, B, C, D, E, F> : public OptionalNodesBase<6> {
	__declspec(align(8)) A a;
	__declspec(align(8)) B b;
	__declspec(align(8)) C c;
	__declspec(align(8)) D d;
	__declspec(align(8)) E e;
	__declspec(align(8)) F f;
	OptionalNodes<A, B, C, D, E, F>(int a, int b, void ** c) : OptionalNodesBase<6>(a,b,c) {};
};

template<class A, class B, class C, class D, class E, class F, class G>
struct OptionalNodes<A, B, C, D, E, F, G> : public OptionalNodesBase<7> {
	__declspec(align(8)) A a;
	__declspec(align(8)) B b;
	__declspec(align(8)) C c;
	__declspec(align(8)) D d;
	__declspec(align(8)) E e;
	__declspec(align(8)) F f;
	__declspec(align(8)) G g;
	OptionalNodes<A, B, C, D, E, F, G>(int a, int b, void ** c) : OptionalNodesBase<7>(a,b,c) {};
};
