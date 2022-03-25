import { OpenAPIV3 } from 'openapi-types';
import _ from 'lodash';
import { ISpec } from './swagger';

type DescribeFn<T extends Record<string, any>> = (params: {
  spec:ISpec,
  path: string,
  prefix: string[],
  describeFn: (params: {
    prefix: string[],
    path: string,
  }) => void,
} & T) => void
const collectSchema = new Set<string>();
const describeRef:DescribeFn<{ref: string}> = (params) => {
  const { ref, spec, path, describeFn } = params;
  const schemaName = ref.split('/').pop();
  // prevent infinite refs
  if(collectSchema.has(schemaName)) { return; }
  collectSchema.add(schemaName);
  const schemaObj = spec.components.schemas[schemaName];
  if((schemaObj as OpenAPIV3.ReferenceObject).$ref) {
    describeRef({
      spec,
      ref: (schemaObj as OpenAPIV3.ReferenceObject).$ref,
      path,
      prefix: [],
      describeFn,
    })
  } else {
    describeSchema({
      spec,
      schema: schemaObj as OpenAPIV3.SchemaObject,
      path,
      describeFn,
      prefix: ['components', 'schemas', schemaName ]
    })
  }
}

const describeArraySchema:DescribeFn<{
  arraySchema: OpenAPIV3.ArraySchemaObject,
}> = (params) => {
  const { spec, path, arraySchema, prefix, describeFn } = params;
  if((arraySchema.items as OpenAPIV3.ReferenceObject).$ref) {
    describeRef({
      ref:(arraySchema.items as OpenAPIV3.ReferenceObject).$ref,
      spec,
      path,
      prefix: [],
      describeFn,
    })
  } else {
    describeSchema({
      schema: (arraySchema.items as OpenAPIV3.SchemaObject),
      spec,
      path,
      prefix,
      describeFn,
    })
  }
  describeFn({ prefix, path })
}
const describeObjectSchema: DescribeFn<{
  objectSchema: OpenAPIV3.NonArraySchemaObject,
}> = (params) => {
  const { objectSchema, spec, path, prefix, describeFn } = params;
  for(const key in objectSchema.properties) {
    const completePath = `${path === '' ? '' : path + '.'}${key}`;
    const value = objectSchema.properties[key];
    if((value as OpenAPIV3.ReferenceObject).$ref) {
      describeRef({
        spec,
        path: completePath,
        ref: (value as OpenAPIV3.ReferenceObject).$ref,
        prefix: [],
        describeFn
      })
    } else {
      describeSchema({
        spec,
        schema: value as OpenAPIV3.SchemaObject,
        path: completePath,
        prefix: prefix.concat(['properties', key]),
        describeFn
      })
    }
  }
  describeFn({ prefix, path })
}

const describeAllOfSchema:DescribeFn<{allOfSchema: OpenAPIV3.BaseSchemaObject}> = (params) => {
  const { allOfSchema, spec, path, prefix, describeFn } = params;
  allOfSchema.allOf.forEach((item, index) => {
    if((item as OpenAPIV3.ReferenceObject).$ref) {
      describeRef({
        spec,
        path,
        ref: (item as OpenAPIV3.ReferenceObject).$ref,
        prefix: [],
        describeFn,
      })
    } else {
      describeSchema({
        spec,
        describeFn,
        schema: item as OpenAPIV3.SchemaObject,
        path,
        prefix: prefix.concat(['allOf', index.toString()]),
      })
    }
  })
}
const describeAnyOfSchema:DescribeFn<{anyOfSchema: OpenAPIV3.BaseSchemaObject}> = (params) => {
  const { anyOfSchema, spec, path, prefix, describeFn } = params;
  anyOfSchema.anyOf.forEach((item, index) => {
    if((item as OpenAPIV3.ReferenceObject).$ref) {
      describeRef({
        ref: (item as OpenAPIV3.ReferenceObject).$ref,
        path, 
        spec,
        prefix: [],
        describeFn,
      })
    } else {
      describeSchema({
        schema: item as OpenAPIV3.SchemaObject,
        path,
        prefix: prefix.concat(['anyOf', index.toString()]),
        spec,
        describeFn
      })
    }
  })
}
const describeSchema:DescribeFn<{
  schema: OpenAPIV3.SchemaObject,
}> = (params) => {
  const { spec, schema, path, prefix, describeFn } = params;
  if((schema as OpenAPIV3.ArraySchemaObject).type === 'array') {
    describeArraySchema({
      spec,
      path,
      prefix,
      arraySchema: schema as OpenAPIV3.ArraySchemaObject,
      describeFn
    })
  } else if ((schema as OpenAPIV3.NonArraySchemaObject).type === 'object') {
    describeObjectSchema({
      spec,
      path,
      prefix,
      objectSchema: schema as OpenAPIV3.NonArraySchemaObject,
      describeFn
    })
  } else if ((schema as OpenAPIV3.BaseSchemaObject).allOf) {
    describeAllOfSchema({
      spec,
      allOfSchema: schema as OpenAPIV3.BaseSchemaObject,
      path,
      prefix,
      describeFn
    })
  } else if((schema as OpenAPIV3.BaseSchemaObject).anyOf) {
    describeAnyOfSchema({
      spec,
      anyOfSchema: schema as OpenAPIV3.BaseSchemaObject,
      path,
      prefix,
      describeFn
    })
  } else {
    describeFn({ prefix, path })
  }
}

export const describeRequestBody:DescribeFn<{ api_name: string }> = (parmas) => {
  const {
    prefix,
    path,
    spec,
    api_name,
    describeFn,
  } = parmas;
  const requestBody = spec.paths[api_name].post.requestBody;
  if((requestBody as OpenAPIV3.ReferenceObject).$ref) {
    describeRef({
      spec,
      path,
      prefix,
      ref: (requestBody as OpenAPIV3.ReferenceObject).$ref,
      describeFn,
    })
  } else if((requestBody as OpenAPIV3.RequestBodyObject).content) {
    Object.keys((requestBody as OpenAPIV3.RequestBodyObject).content).forEach(media => {
      const { schema } = (requestBody as OpenAPIV3.RequestBodyObject).content[media];
      if((schema as OpenAPIV3.ReferenceObject).$ref) {
        describeRef({
          spec,
          path,
          prefix,
          describeFn,
          ref: (schema as OpenAPIV3.ReferenceObject).$ref,
        })
      } else {
        describeSchema({
          spec,
          path,
          describeFn,
          schema: schema as OpenAPIV3.SchemaObject,
          prefix: ['paths', api_name, 'post', 'requestBody', 'content', media, 'schema']
        })
      }
    })
  } 
}