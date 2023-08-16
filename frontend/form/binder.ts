import { BinderNode, CHANGED } from 'Frontend/form/src/BinderNode.js';
import { Ref, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AbstractModel, ModelConstructor, ModelValue, _fromString, hasFromString } from "./src/Models.js";
import { BinderRoot, BinderRootConfiguration } from "./src/BinderRoot.js";
import { useBinderNode } from "./binderNode.js";
import { AbstractFieldStrategy, FieldElement, getDefaultFieldStrategy } from "./src/Field.js";
import { getBinderNode } from './src/BinderNodeHelpers.js';

export function createBinder<T, M extends AbstractModel<T>>(Model: ModelConstructor<T, M>, config?: BinderRootConfiguration<T>) {
  const emptyValue = Model.createEmptyValue();
  return new BinderRoot(Model, config);
}

function useUpdate() {
  const [_, update] = useReducer((x) => !x, true);
  return update;
}

export function useBinder<T, M extends AbstractModel<T>>(Model: ModelConstructor<T, M>, config?: BinderRootConfiguration<T>) {
  const binder = useMemo(() => createBinder(Model, config), []);
  const update = useUpdate();

  useEffect(() => {
    binder.addEventListener(CHANGED, update)
  }, []);

  return {
    binder,
    field<T, M extends AbstractModel<T>>(model: M) {
      const node = getBinderNode(model) as BinderNode<T, M>;
      let field: HTMLElement | null;
      const updateValueEvent = (e: any) => {
        if (field) {
          const elementValue = getDefaultFieldStrategy(field, model).value;
          node.value = typeof elementValue === "string" && hasFromString(model)
            ? model[_fromString](elementValue)
            : elementValue;
        }
      }

      return {
        name: node.name,
        ref(element: HTMLElement | null) {
          field = element;
        },
        // value: contextNode.value,
        // invalid: contextNode.invalid,
        // errorMessage: contextNode.ownErrors[0]?.message || "",
        onBlur: (e: any) => {
          updateValueEvent(e);
          node.visited = true;
        },
        onChange: updateValueEvent,
        onInput: updateValueEvent
      }
    },
  };
}

export function useField<M extends AbstractModel<any>, T = ModelValue<M>>(model: M) {
  const contextNode = useBinderNode<T, M>(model);

  const fieldRef = useRef<FieldElement<T>>(null);
  const strategyRef = useRef<AbstractFieldStrategy<T> | null>(null);

  useEffect(() => {
    strategyRef.current = getDefaultFieldStrategy(fieldRef.current!, model);
  }, [fieldRef.current, model]);

  useEffect(() => {
    strategyRef.current!.value = contextNode.value!;
  }, [strategyRef.current, contextNode.value]);

  useEffect(() => {
    strategyRef.current!.required = contextNode.required;
  }, [strategyRef.current, contextNode.required])

  useEffect(() => {
    strategyRef.current!.invalid = contextNode.invalid!;
  }, [strategyRef.current, contextNode.invalid]);

  useEffect(() => {
    strategyRef.current!.errorMessage = contextNode.ownErrors[0]?.message || "";
  }, [strategyRef.current, (contextNode.ownErrors[0]?.message || "")]);

  const updateValueEvent = (e: any) => {
    const elementValue = strategyRef.current!.value;
    const value = typeof elementValue === "string" && hasFromString(model) ? model[_fromString](elementValue) : elementValue;
    contextNode.setValue(value);
  }

  return {
    name: contextNode.name,
    ref: fieldRef as Ref<any>,
    // value: contextNode.value,
    // invalid: contextNode.invalid,
    // errorMessage: contextNode.ownErrors[0]?.message || "",
    onBlur: (e: any) => {
      updateValueEvent(e);
      contextNode.setVisited(true);
    },
    onChange: updateValueEvent,
    onInput: updateValueEvent
  }
}
