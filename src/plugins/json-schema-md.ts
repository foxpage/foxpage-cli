/*
 * @Author: melody-yangjie
 * @Description: The plug-in references from "https://github.com/saibotsivad/json-schema-to-markdown".
 * Since the author has not updated it for two years, and the author uses the Very Open License,
 * the source code has been down here and some customized modifications have been made.
 * Thanks to Saibotsivad.
 */
import { JSONSchema7 } from 'json-schema';

interface config {
  name?: string;
  footer?: string;
  isShowPaths?: boolean;
  isShowRef?: boolean;
  isShowSchema?: boolean;
}

const defaultCfg = {
  isShowPaths: true,
  isShowRef: true,
  isShowSchema: true,
};

export class JSONSchemaMarkdown {
  public schema: JSONSchema7 | null;
  public markdown: string | null;
  public errors: string[];
  public indentChar: string;
  public pathDivider: string;
  public objectNotation: string;
  public config: config;
  public name: string;
  public footer: string;

  constructor(cfg: config = {}) {
    // Object containing the schema
    this.schema = null;

    // Resulting markdown
    this.markdown = null;

    // Array of errors during load or markdown generation.
    this.errors = [];

    // The character(s) used for indenting the markdown.
    this.indentChar = '\t';

    // The character(s) used for dividing path elements.
    this.pathDivider = '/';

    // The character(s) used for object notation.
    this.objectNotation = '&thinsp;.&thinsp;';

    // config
    this.config = {
      ...defaultCfg,
      ...cfg,
    };
    this.name = this.config.name || '';
    // Text to be included in the documentation's footer.
    // Defaults to optional module attribution.
    this.footer = this.config.footer || '';
  }

  /**
   * Shorthand method to generate markdown from JSON Schema.
   * This is not the prefered method as errors will be more difficult to expose.
   * @param {JSONSchema7} schema JSONSchema7.
   * @returns {String} generated markdown
   */
  static doc(schema: JSONSchema7): string {
    return new this().load(schema).generate();
  }

  /**
   * Load the schema
   * @param {JSONSchema7} schema JSONSchema7.
   */
  load(schema: JSONSchema7): JSONSchemaMarkdown {
    this.errors = [];
    if (typeof schema === 'string') {
      try {
        this.schema = JSON.parse(schema);
      } catch (e) {
        this.error('invalid json');
      }
    } else {
      this.schema = schema;
    }
    return this;
  }

  /**
   * Process loaded schema and generate the markdown
   * @returns {String}
   */
  generate(): string {
    this.markdown = '';
    if (this.errors.length < 1) {
      try {
        this.renderRoot('', this.schema || {}, 0, '#');
      } catch (e) {
        console.log(e);
        this.error(e.toString());
      }
    }
    if (this.errors.length > 0) {
      return this.errors.join('\n');
    } else {
      this.markdown += this.footer;
      return this.markdown;
    }
  }

  // 最外层
  renderRoot(_name: string, data: JSONSchema7, level: number, path: string) {
    this.renderAPI(_name, data, level, path);
    this.renderDefinitions(_name, data, level, path);
  }

  renderAPI(_name: string, data: JSONSchema7, level: number, path: string) {
    this.writeHeader(`${this.name ? this.name + ' ' : ''}Props API:`, level);

    this.renderProperties(_name, data, level, path);

    this.markdown += '\n';
  }

  renderSchemaItem(_name: string, data: JSONSchema7, level: number, path: string) {
    if (typeof data.type === 'string') {
      this.getTypeMethod(data.type)(_name, data, level, path);
    } else if (Array.isArray(data.type)) {
      data.type.map(type => {
        this.getTypeMethod(type)(_name, data, level, path);
      });
    }
  }

  renderProperties(_name: string, data: JSONSchema7, level: number, path: string) {
    this.renderSchemaItem(_name, data, level, path);
    this.markdown += '\n';
  }

  renderDefinitions(_name: string, data: JSONSchema7, level: number, path: string) {
    if (this.notEmpty(data.definitions)) {
      path += '/definitions';
      this.writeHeader('Definitions', level);
      for (const term in data.definitions) {
        const defPath = path + this.pathDivider + term;
        this.writeTerm(term, level, defPath);
        if (data.definitions[term] !== false) {
          this.renderDefinitionItem(term, data.definitions[term] as JSONSchema7, level + 1, defPath);
        }
        this.writeLine('', 0);
      }
    }
  }

  /**
   * This is the primary method that traverses the schema.
   * The method is strictly structural and should not need to be modified for customization.
   * @param {name} name The JSON property name
   * @param {JSONSchema7} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  renderDefinitionItem(name: string, data: JSONSchema7, level: number, path: string) {
    if (data && data['$id']) {
      // set this as base path to children.
      path = '#' + data['$id'];
    }
    //
    this.typeGeneric(name, data, level, path);

    this.renderSchemaItem(name, data, level, path);
  }

  /**
   * This is the shared template for all other types.
   * You may want to override this method to change the order of information in your documentation.
   * @param {name} _name The JSON property name
   * @param {JSONSchema7} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeGeneric(_name: string, data: JSONSchema7, level: number, path: string) {
    this.writeHeader(data.title, level);
    this.writeDescription(data.description, level);
    this.writeType(data.type, level);
    this.writePath(level, path);
    this.writeSchema(data['$schema'] || '', level);
    this.writeRef(data['$ref'], level);
    this.writeId(data['$id'], level);
    this.writeComment(data['$comment'], level);
    this.writeExamples(data.examples, level);
    this.writeEnum(data.enum, level);
    this.writeDefault(data.default, level);
    this.writeAnyOf(data.anyOf, level, path);
    this.writeAllOf(data.allOf, level, path);
    this.writeOneOf(data.oneOf, level, path);
  }

  /**
   *
   * @param {name} name The JSON property name
   * @param {Object} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeArray(_name: string, data: JSONSchema7, level: number, path: string) {
    this.writeAdditionalItems(data.additionalItems);
    if (this.notEmpty(data.minItems) || this.notEmpty(data.maxItems)) {
      this.indent(level);
      this.markdown += 'Item Count: ';
      this.writeMinMax(data.minItems, data.maxItems);
    }
    if (this.notEmpty(data.items)) {
      this.writeSectionName('Items', level + 1);
      if (Array.isArray(data.items)) {
        // Multiple Item Validations / "Tuple validation"
        data.items.map(item => {
          this.renderDefinitionItem('item', item as JSONSchema7, level + 1, path + '/items');
          this.writeLine('', level);
        });
      } else if (this.notEmpty(data.items)) {
        //Normal Validation
        this.renderDefinitionItem('item', data.items as JSONSchema7, level + 1, path + '/items');
      }
    }
  }

  /**
   *
   * @param {name} name The JSON property name
   * @param {Object} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeBoolean() {}

  /**
   *
   * @param {name} name The JSON property name
   * @param {Object} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeNull() {}

  /**
   *
   * @param {name} name The JSON property name
   * @param {Object} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeNumber(_name: string, data: JSONSchema7, level: number, _path: string) {
    if (this.notEmpty(data.minimum) || this.notEmpty(data.maximum)) {
      this.indent(level);
      this.markdown += 'Range: ';
      this.writeMinMax(data.minimum, data.maximum);
    }
    if (this.notEmpty(data.exclusiveMinimum) || this.notEmpty(data.exclusiveMaximum)) {
      this.indent(level);
      this.markdown += 'Exlusive Range: ';
      this.writeMinMaxExlusive(data.exclusiveMinimum, data.exclusiveMaximum);
    }
    this.writeMultipleOf(data.multipleOf);
  }

  /**
   *
   * @param {name} name The JSON property name
   * @param {Object} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeString(_name: string, data: JSONSchema7, level: number, _path: string) {
    this.writeFormat(data.format, level);
    this.writePattern(data.pattern, level);
    if (this.notEmpty(data.minLength) || this.notEmpty(data.maxLength)) {
      this.indent(level);
      this.markdown += 'Length: ';
      this.writeMinMax(data.minLength, data.maxLength);
    }
  }

  /**
   *
   * @param {name} name The JSON property name
   * @param {Object} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeObject(_name: string, data: JSONSchema7, level: number, path: string) {
    const required = this.empty(data.required) ? [] : data.required || [];
    if (this.empty(data.properties)) {
      // Don't need to throw error, keep empty is ok!
      // throw '`object` missing properties at ' + path;
      return '';
    }
    this.writeAdditionalProperties(data.additionalProperties, level);

    if (this.notEmpty(data.minProperties) || this.notEmpty(data.maxProperties)) {
      this.indent(level);
      this.markdown += 'Property Count: ';
      this.writeMinMax(data.minProperties, data.maxProperties);
    }

    this.writePropertyNames(data.propertyNames, level);
    this.writeSectionName('Properties', level);
    path += '/properties';
    for (const propName in data.properties) {
      const propPath = path + this.pathDivider + propName;
      const property = data.properties[propName];
      const isRequired = required.indexOf(propName) > -1;
      this.writePropertyName(propName, level + 1, propPath, isRequired);
      this.renderDefinitionItem(propName, property as JSONSchema7, level + 2, propPath);
    }
  }

  /**
   * This method is a catch for schema types that aren't recongized.
   * You may want to treat anything resolving to this method as an error.
   * @param {name} name The JSON property name
   * @param {Object} data The JS data for the schema
   * @param {integer} level Indentation level
   * @param {String} path String describing the path of the property
   */
  typeUnknown(_name: string, data: JSONSchema7, _level: number, path: string) {
    console.log('unknown prop type "', data.type, '" at ' + path, data);
  }

  /**
   * Markdown writing methods
   */

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/combining.html#anyof
   * @param {JSONSchema7['anyOf']} anyOf
   * @param {Integer} level Indentation level
   */
  writeAnyOf(anyOf: JSONSchema7['anyOf'], level: number, path: string) {
    if (anyOf && this.notEmpty(anyOf)) {
      this.writeLine('anyOf: ', level);
      anyOf.forEach(item => {
        this.renderDefinitionItem('', item as JSONSchema7, level + 1, path);
      });
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/combining.html#allof
   * @param {JSONSchema7['allOf']} allOf
   * @param {Integer} level Indentation level
   */
  writeAllOf(allOf: JSONSchema7['allOf'], level: number, path: string) {
    if (allOf && this.notEmpty(allOf)) {
      this.writeLine('allOf: ', level);
      allOf.forEach(item => {
        this.renderDefinitionItem('', item as JSONSchema7, level + 1, path);
      });
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/combining.html#oneof
   * @param {JSONSchema7['oneOf']} oneOf
   * @param {Integer} level Indentation level
   */
  writeOneOf(oneOf: JSONSchema7['oneOf'], level: number, path: string) {
    if (oneOf && this.notEmpty(oneOf)) {
      this.writeLine('oneOf: ', level);
      oneOf.forEach(item => {
        this.renderDefinitionItem('', item as JSONSchema7, level + 1, path);
      });
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
   * @param {boolean} bool
   * @param {Integer} level Indentation level
   */
  writeAdditionalItems(bool: JSONSchema7['additionalItems'], level?: number) {
    if (this.notEmpty(bool)) {
      if (bool) {
        this.writeLine('This schema <u>does not</u> accept additional items.', level);
      } else {
        this.writeLine('This schema accepts additional items.', level);
      }
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/object.html#property-names
   * @param {boolean} bool
   * @param {Integer} level Indentation level
   *
   */
  writeAdditionalProperties(bool: JSONSchema7['additionalProperties'], level: number) {
    if (this.notEmpty(bool)) {
      if (!bool) {
        this.writeLine('This schema <u>does not</u> accept additional properties.', level);
      } else {
        this.writeLine('This schema accepts additional properties.', level);
      }
    }
  }

  /**
   * Format and write the schema's $comment
   * @see https://json-schema.org/understanding-json-schema/reference/generic.html#comments
   * @param {String} comment The comment
   * @param {Integer} level Indentation level
   *
   */
  writeComment(comment: JSONSchema7['$comment'], level: number) {
    if (this.notEmpty(comment)) {
      this.writeLine('**Comment**<br/>_' + comment + '_', level);
    }
  }

  /**
   * Format and write the *.description
   * @see https://json-schema.org/understanding-json-schema/reference/generic.html
   * @param {*} value The default value
   * @param {Integer} level Indentation level
   *
   */
  writeDefault(value: JSONSchema7['default'], level: number) {
    if (this.notEmpty(value)) {
      this.writeLine('Default: ' + this.valueFormat(value), level);
    }
  }

  /**
   * Format and write the *.description
   * @see https://json-schema.org/understanding-json-schema/reference/generic.html
   * @param {String} description The description may include markdown
   * @param {Integer} level Indentation level
   *
   */
  writeDescription(description: JSONSchema7['description'], level: number) {
    if (description && description.replace) {
      this.writeLine('Desc: _' + description.replace('\n', '<br>') + '_', level);
    }
  }

  /**
   * Write *.enum as a list.
   * @param {array} list Enumerated values
   * @param {Integer} level Indentation level
   *
   */
  writeEnum(list: JSONSchema7['enum'], level: number) {
    if (this.notEmpty(list)) {
      this.writeLine('The value is restricted to the following: ', level);
      this.writeList(list, level + 1);
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#format
   * @param {String} format Format of string
   * @param {Integer} level Indentation level
   *
   */
  writeFormat(format: JSONSchema7['format'], level: number) {
    if (this.notEmpty(format)) {
      this.writeLine('String format must be a "' + format + '"', level);
    }
  }

  /**
   * Write *.examples as a list
   * @see https://json-schema.org/understanding-json-schema/reference/generic.html
   * @param {array} list Examples
   * @param {Integer} level Indentation level
   *
   */
  writeExamples(list: JSONSchema7['examples'], level: number) {
    if (this.notEmpty(list)) {
      this.writeLine('Example values: ', level);
      this.writeList(list, level + 1);
    }
  }

  /**
   * @param {String} header The header to be written
   * @param {Integer} level Header level [H1, H2, H3, H4, H5]
   *
   */
  writeHeader(header: JSONSchema7['title'], level = 1) {
    if (this.notEmpty(header)) {
      this.writeLine('#'.repeat(Math.min(level + 1, 5)) + ' ' + header, level);
    }
  }

  /**
   * Write the $id for reference purposes
   * @see https://json-schema.org/understanding-json-schema/structuring.html#the-id-property
   * @param {String} id the schema's $id
   * @param {Integer} level Indentation level
   *
   */
  writeId(id: JSONSchema7['$id'], level: number) {
    if (this.notEmpty(id)) {
      this.writeLine('<b id="' + this.slugify(id || '') + '">$id: ' + id + '</b>', level);
    }
  }

  /**
   * Write array as markdown list
   * @param {array} list Mixed array to list
   * @param {Integer} level Indentation level
   *
   */
  writeList(list: any[] | any, level = 1) {
    if (list && this.notEmpty(list)) {
      list.map((item: any, idx: number) => {
        this.indent(level, '', ' ' + (idx + 1));
        this.markdown += '. ' + this.valueFormat(item) + '\n';
      });
    }
  }

  /**
   * Write notation for inclusive minimum and maximum.
   * @param {number} min Inclusive minimim
   * @param {number} max Inclusive maximum
   *
   */
  writeMinMax(min: number | undefined, max: number | undefined) {
    if (this.notEmpty(min) && this.notEmpty(max)) {
      this.markdown += 'between ' + min + ' and ' + max + '\n';
    } else if (this.notEmpty(min)) {
      // &ge;
      this.markdown += ' ≥ ' + min + '\n';
    } else if (this.notEmpty(max)) {
      // &le;
      this.markdown += ' ≤ ' + max + '\n';
    }
  }

  /**
   * Write notation for exclusive minimum and maximum.
   * @param {number} min Exclusive minimim
   * @param {number} max Exclusive maximum
   *
   */
  writeMinMaxExlusive(min: number | undefined, max: number | undefined) {
    if (this.notEmpty(min)) {
      this.markdown += ' > ' + min + '\n';
    }
    if (this.notEmpty(min) && this.notEmpty(max)) {
      this.markdown += ' & ';
    }
    if (this.notEmpty(max)) {
      this.markdown += ' < ' + max + '\n';
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples
   * @param {Number} number Regular Expression that string must match.
   * @param {Integer} level Indentation level
   *
   */
  writeMultipleOf(number: JSONSchema7['multipleOf'], level?: number) {
    if (this.notEmpty(number)) {
      this.writeLine('The value must be a multiple of `' + number + '`', level);
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
   * @param {String} pattern Regular Expression that string must match.
   * @param {Integer} level Indentation level
   *
   */
  writePattern(pattern: JSONSchema7['pattern'], level: number) {
    if (this.notEmpty(pattern)) {
      this.writeLine('The value must match this pattern: `' + pattern + '`', level);
    }
  }

  /**
   * Writes the features of object.propertyNames
   * @see https://json-schema.org/understanding-json-schema/reference/object.html#property-names
   * @param {String} data Schema object
   * @param {Integer} level Indentation level
   *
   */
  writePropertyNames(data: JSONSchema7['propertyNames'], level: number) {
    if (this.notEmpty(data) && data && typeof data !== 'boolean' && this.notEmpty(data.pattern)) {
      this.writeLine('Property names must match this pattern: `' + data.pattern + '`', level);
    }
  }

  /**
   * @param {String} prop Property name
   * @param {Integer} level Indentation level
   * @param {String} path String describing the path of the property
   * @param {boolean} required Property is required (True or False [default])
   *
   */
  writePropertyName(prop: string, level: number, path: string, required = false) {
    this.indent(level);
    const _path = path.slice(1);
    this.markdown += '<b id="' + _path + '">' + prop + '</b>';
    if (required) {
      this.markdown += ` <span style="color: #f5222d;"> \`required\` </span> `;
    }
    this.markdown += '\n';
  }

  /**
   * Writes a link to the referenced schema
   * @see https://json-schema.org/understanding-json-schema/structuring.html#reuse
   * @param {String} ref $ID, path, or URI
   * @param {Integer} level Indentation level
   *
   */
  writeRef(ref: JSONSchema7['$ref'], level: number) {
    if (this.config.isShowRef && this.notEmpty(ref)) {
      this.writeLine('$ref: [' + ref + '](' + this.refLink(ref || '') + ')', level);
    }
  }

  /**
   * Writes the path for reference purposes
   * @param {Integer} level Indentation level
   * @param {String} path String describing the path of the property
   *
   */
  writePath(level: number, path: string) {
    if (this.config.isShowPaths && this.notEmpty(path)) {
      this.writeLine('<i id="' + path + '">path: ' + path + '</i>', level);
    }
  }

  /**
   * Writes the declared schema URI
   * @see https://json-schema.org/understanding-json-schema/basics.html#declaring-a-json-schema
   * @param {String} uri
   * @param {Integer} level Indentation level
   *
   */
  writeSchema(uri: JSONSchema7['$schema'], level: number) {
    if (this.config.isShowSchema && this.notEmpty(uri)) {
      this.writeLine('$schema: [' + uri + '](' + this.refLink(uri || '') + ')', level);
    }
  }

  /**
   * Writes a section name
   * @param {String} name
   * @param {Integer} level Indentation level
   *
   */
  writeSectionName(name: string, level = 1) {
    if (this.notEmpty(name)) {
      this.writeLine('**_' + name + '_**', level);
    }
  }

  /**
   * Writes a definition term
   * @param {String} term
   * @param {Integer} level Indentation level
   *
   */
  writeTerm(term: string, level: number, path = '#'): void {
    if (this.notEmpty(term)) {
      this.writeLine(`<strong><em id="${path.slice(1)}">${term}</em></strong>`, level);
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/basics.html#the-type-keyword
   * @param {String} type
   * @param {Integer} level Indentation level
   *
   */
  writeType(type: JSONSchema7['type'], level: number): void {
    if (this.notEmpty(type)) {
      if (Array.isArray(type) && type.length > 1) {
        this.writeLine('Types: `' + type.join('`, `') + '`', level);
      } else {
        this.writeLine('Type: `' + type + '`', level);
      }
    }
  }

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#uniqueness
   * @param {boolean} bool
   * @param {Integer} level Indentation level
   *
   */
  writeUniqueItems(bool: boolean, level: number): void {
    if (this.notEmpty(bool)) {
      if (bool) {
        this.writeLine('Each item must be unique', level);
      }
    }
  }

  /**
   * Below are utility methods.
   **/

  /**
   * Handles finding correct method for different schema types.
   * @param {String} type The schema type/
   * @returns {nm$_JSONSchemaMarkdown.JSONSchemaMarkdown.typeUnknown}
   */
  getTypeMethod(type: string) {
    switch (type.toLowerCase?.()) {
      case 'string':
        return this.typeString.bind(this);
      case 'integer':
      case 'number':
        return this.typeNumber.bind(this);
      case 'object':
        return this.typeObject.bind(this);
      case 'array':
        return this.typeArray.bind(this);
      case 'boolean':
        return this.typeNull.bind(this);
      default:
        return this.typeUnknown.bind(this);
    }
  }

  /**
   * Writes indentation at the given level.
   * @param {Integer} level Indentation level
   * @param {string} indentChar Character to use for indentation. Defaults to this.indentChar
   * @param {type} listChar Character to use for list
   */
  indent(level: number, indentChar = '', listChar = ' - '): void {
    if (level > 1) {
      this.markdown += (indentChar || this.indentChar).repeat(level - 1);
    }
    if (level > 0) {
      this.markdown += listChar;
    }
  }

  // Converts boolean to string "true" or "false"
  valueBool(bool: string | boolean): string {
    if (typeof bool === 'string') {
      return bool;
    } else {
      return bool ? 'true' : 'false';
    }
  }

  /**
   * Convert mixed values into markdown notation.
   * @param {mixed} value
   */
  valueFormat(value: any): string {
    if (value === 'true' || value === 'false') {
      return '_' + value + '_';
    } else if (typeof value === 'boolean') {
      return '_' + this.valueBool(value) + '_';
    } else if (typeof value === 'string') {
      return '_"' + value + '"_';
    } else {
      return '`' + value + '`';
    }
  }

  /**
   * Utility method for writing line to the markdown.
   * Handles line break logic.
   */
  writeLine(text = '', level = 1): void {
    this.indent(level);
    this.markdown += text + '\n';
    if (level < 1) {
      this.markdown += '\n';
    }
  }

  // Prepare $ref as a link.
  refLink(ref: string): string {
    if (ref[0] !== '#' && ref.substring(0, 4).toLowerCase() !== 'http') {
      ref = '#' + this.slugify(ref);
    }
    return ref;
  }

  // Make a string into a slug string.
  slugify(string: string): string {
    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/&/g, '-and-') // Replace & with "-and-"
      .replace(/[^\w-.]+/g, '') // Remove all non-word characters
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  // Check if value is empty
  empty(value: any): boolean {
    return (
      value === null || value === undefined || (typeof value === 'string' && value.length < 1) || String(value) === '[]'
    );
  }

  // Check if value is NOT empty
  notEmpty(value: any): boolean {
    return !this.empty(value);
  }

  // Append error to errors array
  error(error: string) {
    this.errors.push(error);
  }
}
