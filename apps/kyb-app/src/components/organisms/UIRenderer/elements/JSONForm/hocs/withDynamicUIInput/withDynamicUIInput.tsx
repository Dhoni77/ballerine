import { usePageResolverContext } from '@app/components/organisms/DynamicUI/PageResolver/hooks/usePageResolverContext';
import { useStateManagerContext } from '@app/components/organisms/DynamicUI/StateManager/components/StateProvider';
import { useDynamicUIContext } from '@app/components/organisms/DynamicUI/hooks/useDynamicUIContext';
import { findDefinitionByName } from '@app/components/organisms/UIRenderer/elements/JSONForm/helpers/findDefinitionByName';
import { useUIElementErrors } from '@app/components/organisms/UIRenderer/hooks/useUIElementErrors/useUIElementErrors';
import { useUIElementHandlers } from '@app/components/organisms/UIRenderer/hooks/useUIElementHandlers';
import { useUIElementProps } from '@app/components/organisms/UIRenderer/hooks/useUIElementProps';
import { useUIElementState } from '@app/components/organisms/UIRenderer/hooks/useUIElementState';
import { UIElement } from '@app/domains/collection-flow';
import { AnyObject, ErrorsList, RJSFInputAdapter, RJSFInputProps } from '@ballerine/ui';
import get from 'lodash/get';
import { useCallback, useMemo } from 'react';

const findLastDigit = (str: string) => {
  const digitRegex = /_(\d+)_/g;
  const matches = digitRegex.exec(str);

  if (matches && matches.length > 0) {
    const result = parseInt(matches[matches.length - 1]);
    return result;
  }

  return null;
};

const getInputIndex = (inputId: string) => findLastDigit(inputId);

const injectIndexToDestinationIfNeeded = (destination: string, index: number | null): string => {
  if (index === null) return destination;

  const result = destination.replace(`{INDEX}`, `${index}`);

  return result;
};

export type DynamicUIComponent<TProps, TParams = AnyObject> = React.ComponentType<
  TProps & { definition: UIElement<TParams> }
>;

export const withDynamicUIInput = (Component: RJSFInputAdapter<any, any>) => {
  function Wrapper(props: RJSFInputProps) {
    const inputId = (props.idSchema as AnyObject)?.$id as string;
    const { name, onChange } = props;
    const { payload } = useStateManagerContext();
    const { currentPage } = usePageResolverContext();
    const { state } = useDynamicUIContext();

    const baseDefinition = useMemo(() => {
      const definition = findDefinitionByName(name, currentPage.elements);

      if (!definition) throw new Error('definition not found');

      return definition;
    }, [name, currentPage]);

    const definition = useMemo(() => {
      const inputIndex = getInputIndex(inputId || '');

      return {
        ...baseDefinition,
        name: inputIndex !== null ? `${baseDefinition.name}[${inputIndex}]` : baseDefinition.name,
        valueDestination: injectIndexToDestinationIfNeeded(
          baseDefinition.valueDestination,
          inputIndex,
        ),
      };
    }, [baseDefinition, inputId]);

    const { state: elementState, setState: setElementState } = useUIElementState(definition);

    const isTouched = elementState.isTouched;

    const setTouched = useCallback(
      (touched: boolean) => {
        setElementState(definition.name, { ...elementState, isTouched: touched });
      },
      [definition, elementState, setElementState],
    );

    const { disabled } = useUIElementProps(definition);

    const { onChangeHandler } = useUIElementHandlers(definition);

    const handleChange = useCallback((value: unknown) => {
      const evt = {
        target: {
          name: definition.name,
          value: !value && value !== 0 && value !== false ? undefined : value,
        },
      };
      onChangeHandler(evt as React.ChangeEvent<any>);
      onChange(value);
    }, []);

    const handleBlur = useCallback(() => {
      setTouched(true);
    }, []);

    const value = useMemo(
      () => get(payload, definition.valueDestination) as unknown,
      [payload, definition],
    );

    const { validationErrors, warnings } = useUIElementErrors(definition);

    return (
      <div className="flex flex-col gap-2">
        <Component
          {...props}
          disabled={disabled || props.disabled || state.isLoading}
          formData={value}
          definition={definition}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {warnings.length ? <ErrorsList errors={warnings.map(err => err.message)} /> : null}
        {isTouched ? <ErrorsList errors={validationErrors.map(error => error.message)} /> : null}
      </div>
    );
  }

  return Wrapper;
};
