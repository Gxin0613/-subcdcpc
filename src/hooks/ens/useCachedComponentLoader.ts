import useComponentLoader from './useComponentLoader';
export default function useCachedComponentLoader(componentUrl: string) {
  const { loadComponent } = useComponentLoader();
  return loadComponent(componentUrl);
}
