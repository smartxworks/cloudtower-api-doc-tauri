import { OpenAPIV3 } from 'openapi-types';
import _ from 'lodash';

type DescribeFn<T extends Record<string, any>> = (params: {
  path?: string,
  prefix: string[],
  describeFn: (params: {
    prefix: string[],
    path: string,
  }) => void,
} & T) => void
const describeRef:DescribeFn<{}> = (params) => {
  const { path, describeFn, prefix } = params;
  describeFn({
    prefix,
    path,
  })
}

const describeArraySchema:DescribeFn<{
  arraySchema: OpenAPIV3.ArraySchemaObject,
}> = (params) => {
  const { path, arraySchema, prefix, describeFn } = params;
  const nextPrefix = [...prefix, 'items'];
  if((arraySchema.items as OpenAPIV3.ReferenceObject).$ref) {
    describeRef({
      path,
      prefix: nextPrefix,
      describeFn,
    })
  } else {
    describeSchema({
      schema: (arraySchema.items as OpenAPIV3.SchemaObject),
      path,
      prefix: nextPrefix,
      describeFn,
    })
  }
  describeFn({ prefix, path })
}
const describeObjectSchema: DescribeFn<{
  objectSchema: OpenAPIV3.NonArraySchemaObject,
}> = (params) => {
  const { objectSchema, path, prefix, describeFn } = params;
  for(const key in objectSchema.properties) {
    const completePath = `${path === undefined ? '' : path + '.'}${key}`;
    const value = objectSchema.properties[key];
    const nextPrefix = prefix.concat(['properties', key])
    if((value as OpenAPIV3.ReferenceObject).$ref) {
      describeRef({
        path: completePath,
        prefix: nextPrefix,
        describeFn
      })
    } else {
      describeSchema({
        schema: value as OpenAPIV3.SchemaObject,
        path: completePath,
        prefix: nextPrefix,
        describeFn
      })
    }
  }
  describeFn({ prefix, path })
}

const describeAllOfSchema:DescribeFn<{allOfSchema: OpenAPIV3.BaseSchemaObject}> = (params) => {
  const { allOfSchema, path, prefix, describeFn } = params;
  allOfSchema.allOf.forEach((item, index) => {
    const nextPrefix =  prefix.concat(['allOf', index.toString()])
    if((item as OpenAPIV3.ReferenceObject).$ref) {
      describeRef({
        path,
        prefix: nextPrefix,
        describeFn,
      })
    } else {
      describeSchema({
        describeFn,
        schema: item as OpenAPIV3.SchemaObject,
        path,
        prefix: nextPrefix,
      })
    }
  })
}
const describeAnyOfSchema:DescribeFn<{anyOfSchema: OpenAPIV3.BaseSchemaObject}> = (params) => {
  const { anyOfSchema, path, prefix, describeFn } = params;
  anyOfSchema.anyOf.forEach((item, index) => {
    const nextPrefix = prefix.concat(["anyOf", index.toString()])
    if((item as OpenAPIV3.ReferenceObject).$ref) {
      describeRef({
        path, 
        prefix: nextPrefix,
        describeFn,
      })
    } else {
      describeSchema({
        schema: item as OpenAPIV3.SchemaObject,
        path,
        prefix: nextPrefix,
        describeFn
      })
    }
  })
}

export const describeSchema:DescribeFn<{
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
}> = (params) => {
  const { schema, path, prefix, describeFn } = params;
  if((schema as OpenAPIV3.ArraySchemaObject).type === 'array') {
    describeArraySchema({
      path,
      prefix,
      arraySchema: schema as OpenAPIV3.ArraySchemaObject,
      describeFn
    })
  } else if ((schema as OpenAPIV3.NonArraySchemaObject).type === 'object') {
    describeObjectSchema({
      path,
      prefix,
      objectSchema: schema as OpenAPIV3.NonArraySchemaObject,
      describeFn
    })
  } else if ((schema as OpenAPIV3.BaseSchemaObject).allOf) {
    describeAllOfSchema({
      allOfSchema: schema as OpenAPIV3.BaseSchemaObject,
      path,
      prefix,
      describeFn
    })
  } else if((schema as OpenAPIV3.BaseSchemaObject).anyOf) {
    describeAnyOfSchema({
      anyOfSchema: schema as OpenAPIV3.BaseSchemaObject,
      path,
      prefix,
      describeFn
    })
  } else if ((schema as OpenAPIV3.ReferenceObject).$ref) {
    describeRef({
      prefix,
      path,
      describeFn
    })
  } else {
    describeFn({ prefix, path: (schema as OpenAPIV3.BaseSchemaObject).enum ? 'enum' : path })
  }
}