import { prisma } from '@/infrastructure/database';
import { auth } from '@/infrastructure/auth';
import { redirect } from 'next/navigation';
import TransactionList from './TransactionList';

/**
 * Transactions List Page
 */
export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // 获取最近的交易记录 (最多 50 条)
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 50,
  });

  // 转换为可序列化的数据
  const serializedTransactions = transactions.map((tx) => ({
    id: tx.id,
    date: tx.date,
    type: tx.type,
    description: tx.description,
    originalAmount: tx.originalAmount.toString(),
    currency: tx.currency,
    amountCNY: tx.amountCNY.toString(),
    category: {
      name: tx.category.name,
    },
  }));

  return <TransactionList initialTransactions={serializedTransactions} />;
}
