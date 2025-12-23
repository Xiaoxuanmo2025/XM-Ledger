import { getOrInitializeCategories } from '../actions';
import CategoryManager from './CategoryManager';

/**
 * Categories Management Page
 */
export default async function CategoriesPage() {
  const categories = await getOrInitializeCategories();

  return <CategoryManager initialCategories={categories} />;
}
