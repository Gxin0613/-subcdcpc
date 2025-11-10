// 文件接口定义
export interface FileItem {
  id: string;
  name: string;
  content: string;
  type: 'file' | 'folder';
  parentId: string | null;
  attachments?: Attachment[];
}

// 附件接口定义
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// 知识库接口定义
export interface KnowledgeBase {
  id: string;
  name: string;
  coverImage: string;
  description: string;
  visibility: 'public' | 'private' | 'workspace';
  createdAt: string;
  updatedAt: string;
  files: FileItem[];
  isShowWaterMark: boolean;
  waterText: string;
}

// 知识库表单数据类型
export type KnowledgeBaseFormData = Omit<KnowledgeBase, 'id' | 'coverImage' | 'createdAt' | 'updatedAt' | 'files'>;
