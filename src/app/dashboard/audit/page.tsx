import { getAuditLogs } from '../actions';

/**
 * Audit Log Page
 *
 * 显示所有操作审计日志，防止做假账
 */
export default async function AuditLogPage() {
  const logs = await getAuditLogs({ limit: 100 });

  // 操作类型中文映射
  const actionLabels: Record<string, string> = {
    CREATE_TRANSACTION: '创建交易',
    DELETE_TRANSACTION: '删除交易',
    IMPORT_TRANSACTIONS: '批量导入',
    EXPORT_TRANSACTIONS: '导出记录',
  };

  // 操作类型颜色
  const actionColors: Record<string, string> = {
    CREATE_TRANSACTION: 'bg-green-100 text-green-800',
    DELETE_TRANSACTION: 'bg-red-100 text-red-800',
    IMPORT_TRANSACTIONS: 'bg-blue-100 text-blue-800',
    EXPORT_TRANSACTIONS: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">操作审计日志</h1>
        <p className="text-gray-600 mt-1">
          记录所有关键操作，防止做假账。显示最近 100 条记录。
        </p>
      </div>

      {/* 审计日志列表 */}
      <div className="card">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无操作记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    详细信息
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => {
                  const details = log.details ? JSON.parse(log.details) : {};

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.createdAt).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.user ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {log.user.name || log.user.email || '未知用户'}
                            </span>
                            {log.user.name && log.user.email && (
                              <span className="text-xs text-gray-500">
                                {log.user.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">未知</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            actionColors[log.action] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.action === 'CREATE_TRANSACTION' && (
                          <div>
                            <div>
                              {details.type === 'INCOME' ? '收入' : '支出'}: ¥
                              {details.amountCNY}
                            </div>
                            <div className="text-xs text-gray-400">
                              {details.description || '无描述'}
                            </div>
                          </div>
                        )}
                        {log.action === 'DELETE_TRANSACTION' && (
                          <div>
                            <div className="text-red-600">
                              删除 {details.type === 'INCOME' ? '收入' : '支出'}: ¥
                              {details.amountCNY}
                            </div>
                            <div className="text-xs text-gray-400">
                              原记录: {details.description || '无描述'}
                            </div>
                            {details.createdBy && (
                              <div className="text-xs text-gray-400">
                                创建者: {details.createdBy}
                              </div>
                            )}
                          </div>
                        )}
                        {log.action === 'IMPORT_TRANSACTIONS' && (
                          <div>
                            <div>
                              导入 {details.totalRows} 行，成功 {details.successCount} 条，失败{' '}
                              {details.failedCount} 条
                            </div>
                            {details.errorSummary && details.errorSummary.length > 0 && (
                              <div className="text-xs text-red-600 mt-1">
                                {details.errorSummary.slice(0, 3).join('; ')}
                              </div>
                            )}
                          </div>
                        )}
                        {log.action === 'EXPORT_TRANSACTIONS' && (
                          <div>导出 {details.transactionCount} 条交易记录</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
