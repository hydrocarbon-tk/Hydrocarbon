#pragma once

#include "./type_defs.h"
#include <vector>
#include <iostream>
/*
 * Copyright 2021 Anthony C Weathersby
 * Licensed under MIT
 */

// This is the base class for AST node structures defined within
// Hydrocarbon grammar files. This Class is subclassed using an
// automated JS-C++ conversion process.

namespace HYDROCARBON
{
     static const u64 NaNMask = (u64)0x7FF << 52;

     static const u64 FPSignBitMask = (u64)1 << 63;

     static const u64 PtrMask = ~(NaNMask | FPSignBitMask | 3);

     // [storage]
     // All objects associated with Hydrocarbon nodes use
     // the type object for pointer storage and type references.
     // It takes advantage of the IEEE 754 64bit signaling NaN
     // to store non FP data within a 64bit wide memory space

     // IEEE 754 64bit FP bits are organized into the following groups:
     // 63       : Sign
     // 62 - 52  : Exponent
     // 51 - 0   : Significand (Fraction)

     // The floating point is NaN if all Exponent bits are 1 and the Significand is a
     // non-zero value. Sign is ignored

     /**
      * Stores (token) string data and AST node ptr information
      */
     typedef struct ASTRef
     {
          
          typedef std::vector<ASTRef> ASTRefVector;

          enum TYPE
          {
               NODE,
               TOKEN,
               INVALID_TOKEN,
               Null,
               VECTOR
          };

     private:
           u64 store;

     public:
          ASTRef() : store(0) {}

          ASTRef(const ASTRef &ref) : store(ref.store) {}

          // For Node Pointers
          ASTRef(void *);

          // For Valid Tokens and Invalid Tokens
          ASTRef(unsigned, unsigned, bool = false);

          /**
           * True if the ASTRef does not represent an underlying resource
           * and its internal value is 0;
           */
          bool isNull() const;
          /**
           * True if the base type is a (AST) Node object.
           */
          bool isNode() const;
          /**
           * True if the base type is a (AST) Node voctor object.
           */
          bool isVector() const;

          /**
           * True if the token is invalid. 
           */
          bool isInvalidToken() const;

          /**
           * True if the base type is a offset length value pair.
           */
          bool isToken() const;

          template <typename T>
          T *toNode() const
          {
               return isNode() ? (T *)store : nullptr;
          };

          void print(const char *) const;
          /**
           * Returns enum val ASTRef::TYPE representing the type 
           * of the underlying resource;
           * One of: NODE | TOKEN | INVALID_TOKEN | NULL | VECTOR
           */
          TYPE getType() const;

          /**
           * Print the type of the underlying resource. 
           * One of: NODE | TOKEN | INVALID_TOKEN | NULL | VECTOR
           */
          void printType() const;

          // Token Code ------------------------------------------------
          /**
           * Returns the length of the underlying token or 
           * 0 if the underlying resource is not a token
           */
          unsigned token_length() const;
          /**
           * Returns the offset of the underlying token or 
           * 0 if the underlying resource is not a token
           */
          unsigned token_offset() const;

          // Vector Code ------------------------------------------------

     private:
          ASTRefVector *toVectorPtr() const;

     public:
          template <typename... Ts>
          static ASTRef vector(Ts... args)
          {

               ASTRefVector *vector = new ASTRefVector();

               ASTRef vector_ref(vector);

               vector_ref.store |= 3;

               vector_ref.push(args...);

               return vector_ref;
          }
          /**
          * If the AST ref type is a vector, then pushes the 
          * givin arguments into the underlying vector object. 
          */
          template <typename... Ts>
          void push(Ts... args)
          {

               if (isVector())
               {

                    ASTRef nodes[] = {args...};

                    auto length = sizeof(nodes) / sizeof(ASTRef);

                    auto vector = toVectorPtr();

                    for (auto i = 0; i < length; i++)
                         vector->push_back(nodes[i]);
               }
               else
               {
                    std::cout << "Invalid push to non vector ASTRef" << std::endl;
               }
          }

          /**
           * Returns the stored element count of the vector, if the underlying resource
           * is a vector. Otherwise, -1 is returned. 
           */
          int size() const;

          // Overloads

          /**
           * Returns the ASTref stored at index if the underlying resource is a vector.
           * If the underlying resource is not a vector, or index is out of range, then
           * a NULL ASTRef is returned 
           */
          ASTRef operator[](int &index) const
          {
               if (isVector() && index < size() && index >= 0)
                    return (*toVectorPtr())[index];
               else
                    return ASTRef();
          }

          // Conversion operators ------------------------------------------------

          operator bool() const { return !isNull(); };

          template <typename T>
          operator T *() const { return toNode<T>(); }

     } ASTRef;

} // namespace HYDROCARBON
