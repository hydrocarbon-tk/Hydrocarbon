

# Hydrocarbon Toolkit Tools



## Sub-Commands
### disassemble
> hc.tools **disassemble** [**--o** &lt;*Output Directory Path*&gt;]? [**--browse**]? &lt;*path_to_hcs*&gt;


Create a Bytecode sheet from a Hydrocarbon States file (*.hcs).

If a <path_to_hcs> is not specified, then input from stdin read.

#### Arguments:

- >&lt;*path_to_hcs*&gt;

     Accepted values: [ <span style="color:green">stdin</span> | File Path ]

- #### o
    > **--o**  &lt;*Output Directory Path*&gt;

    Accepted values: [ <span style="color:green">stdout</span> | File Path ]


    
    Directory within which files will be created/overwritten. Defaults to CWD.
    If the directory path is not terminated with a forward slash '/', then the
    last path part is taken to mean the filename of the output. Otherwise,
    the filename of the source grammar file will be used.
    
    All output files will have the extension "*.hcgr".


- #### browse
    > **--browse** 

    Open the bytecode sheet in the default browser.


-----
### railroad
> hc.tools **railroad**  &lt;*Path to *.hcgr*&gt;


Create a Bytecode sheet from a Hydrocarbon Grammar Resource file (*.hcgr)

#### Arguments:

- >&lt;*Path to *.hcgr*&gt; **REQUIRED**


     Accepted values: [ <span style="color:green">stdin</span> | File Path ]

-----
### fuzz
> hc.tools **fuzz**  &lt;*Path to *.hcgr*&gt;


Create a random string from a Hydrocarbon Grammar Resource file  (*.hcgr)

#### Arguments:

- >&lt;*Path to *.hcgr*&gt; **REQUIRED**


     Accepted values: [ <span style="color:green">stdin</span> | File Path ]

-----
