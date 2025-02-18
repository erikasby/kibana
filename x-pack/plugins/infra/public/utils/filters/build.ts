/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  BooleanRelation,
  buildCombinedFilter,
  buildPhraseFilter,
  buildExistsFilter,
  Filter,
  isCombinedFilter,
} from '@kbn/es-query';
import type { DataView } from '@kbn/data-views-plugin/common';

export const buildExistsHostsFilter = ({
  field,
  dataView,
}: {
  field: string;
  dataView?: DataView;
}) => {
  if (!dataView) {
    return {
      meta: {},
      query: {
        exists: {
          field,
        },
      },
    };
  }
  const indexField = dataView.getFieldByName(field)!;
  return buildExistsFilter(indexField, dataView);
};

export const buildCombinedHostsFilter = ({
  field,
  values,
  dataView,
}: {
  values: string[];
  field: string;
  dataView?: DataView;
}) => {
  if (!dataView) {
    return {
      query: {
        terms: {
          [field]: values,
        },
      },
      meta: {},
    };
  }
  const indexField = dataView.getFieldByName(field)!;
  const filtersFromValues = values.map((value) => buildPhraseFilter(indexField, value, dataView));

  return buildCombinedFilter(BooleanRelation.OR, filtersFromValues, dataView);
};

export const retrieveFieldsFromFilter = (filters: Filter[], fields: string[] = []) => {
  for (const filter of filters) {
    if (isCombinedFilter(filter)) {
      retrieveFieldsFromFilter(filter.meta.params, fields);
    }

    if (filter.meta.key) {
      fields.push(filter.meta.key);
    }
  }

  return fields;
};
