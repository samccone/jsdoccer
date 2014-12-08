          {{#each functions}}
            <div class="function_block">
              {{#with description}}
                <div class="function_signature">
                  <a href="#{{@key}}"><h3>&#x25cf; {{@key}}({{paramStr}})</h3></a>
                </div>
                {{{description.full}}}

                {{#if params}}
                  <div class="params">
                    <h4>Params</h4>
                    {{#each params}}
                      <div class="param">
                        <span class="param-name">{{name}}</span>
                        <span class="param-types">{{#if typeStr}}({{typeStr}}){{/if}}</span>
                        <span class="param-description">{{#if description}} &nbsp; {{description}} {{/if}}</span>
                      </div>
                    {{/each}}
                  </div>
                {{/if}}
              {{/with}}

              {{#if examples}}
                <h4>Examples</h4>
                {{#each examples}}
                  <div class="example_block">
                    <h4><a href="#">{{name}}</a></h4>
                    <div class="example_content">
                      {{{example}}}
                    </div>
                  </div>
                {{/each}}
              {{/if}}
            </div>
          {{/each}}
