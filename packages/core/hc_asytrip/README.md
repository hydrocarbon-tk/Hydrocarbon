

# Hydrocarbon Abstract Syntax Tree Toolkit


## Sub-Commands
### compile
> hc.asytrip **compile** [**--o** &lt;*Output Path*&gt;]? [**--t** &lt;*Target Language*&gt;]? &lt;*Path to *.hcgr*&gt;



Compile an ASYtrip AST from a Hydrocarbon grammar resource file (.hcgr)

#### Arguments:

- >&lt;*Path to *.hcgr*&gt;

     Accepted values: [ <span style="color:green">stdin</span> | File Path ]

- #### o
    > **--o**  &lt;*Output Path*&gt;

    Accepted values: [ <span style="color:green">stdout</span> | File Path ]


    
    Filepath to the output file that will be created/overwritten.
    May also specify [stdout] to output to terminal buffer.
    
    


- #### t
    > **--t**  &lt;*Target Language*&gt;

    Accepted values: [ <span style="color:green">rust</span> | <span style="color:green">go</span> | <span style="color:green">ts</span> ]


    Target language to write the AST in.


-----
