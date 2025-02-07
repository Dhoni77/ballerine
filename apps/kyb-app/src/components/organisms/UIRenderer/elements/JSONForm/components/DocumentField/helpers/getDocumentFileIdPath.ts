import { UIElement } from '@app/domains/collection-flow';

export const getDocumentFileIdPath = (definition: UIElement) =>
  definition.valueDestination.replace(/documents\[\d+\]\./g, '');
