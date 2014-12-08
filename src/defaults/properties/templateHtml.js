        {{#if properties}}
          <h3> Properties </h3>
          {{#each properties}}
            <div class="property_block">
              {{#with description}}
                <div class="property">
                  <a href="#{{@key}}"><h3>&#x25cf; {{@key}}</h3></a>
                </div>
                {{{description.full}}}
              {{/with}}

              {{#if examples}}
                <h4>Examples</h4>
                {{#each examples}}
                  <div class="example_block">
                    <h4>{{name}}</h4>
                    {{{example}}}
                  </div>
                {{/each}}
              {{/if}}
            </div>
          {{/each}}
        {{/if}}