import { FieldProps } from '@rjsf/utils';

export type RJSFInputProps<TWrappedComponentProps = object> = FieldProps & TWrappedComponentProps;
export type RJSFInputAdapter<
  TValueType = string,
  TWrappedComponentProps = object,
> = React.ComponentType<FieldProps<TValueType> & TWrappedComponentProps>;
