# Hydrocarbon: The First Encounter

# Install 

Different parts can be used independent of the parts provided with the correct source files.

Install The Core HC library

```
npm install -g hctoolkit
```

```bash
mkdir ./tmp && cd ./tmp
```

```bash
touch ./my_grammar.hcg
```


```hcg
@IGNORE g:sp

<> entry > \hello \world

```

```sh
$ hc.grammar compile ./my_grammar.hcg
```

should see
```sh
 ℹ️  00:00:00 compiler [INFO] 
  ╰─• Resource file successfully written to .../tmp/my_grammar.hcgr

```

```sh
$ hc.bytecode compile ./my_grammar.hcgr
```

nets 
- my_grammar.hcb - Bytecode binary
- my_grammar.hcs - States file