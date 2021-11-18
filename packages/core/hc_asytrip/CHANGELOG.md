## [v0.0.2] - 2021-11-18 

- [2021-11-15]

    ASYTrip supports two forms of struct property declarations that do not need to have a value specified:  - Inferred Type:  The declaration `f:r { { t_TypeName } }` will be converted to `f:{ { type: t_TypeName } }` when parsed.  - Inferred Reference:  The declaration `f:r { { $some_value } }` will be converted to `f: { { some_value: $some_value } }` when parsed.

## [v0.0.1] 

- No changes recorded prior to this version.