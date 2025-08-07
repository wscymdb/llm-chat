import useLLMStore from '@/store';
import type { FormProps } from 'antd';
import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

type FieldType = {
  title?: string;
};

interface IProps {
  onClose: (refresh: boolean) => void;
}

export default (props: IProps) => {
  const { onClose } = props;
  const [form] = Form.useForm<FieldType>();

  const { curConversation, getLocalConversation, changeLocalConversationLabel } = useLLMStore();

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    const conversation = await getLocalConversation(curConversation);
    console.log(conversation, 'cu');
    form.setFieldValue('title', conversation?.label || '');
  };

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);

    changeLocalConversationLabel(curConversation, values?.title || '');
    onClose(true);
  };

  return (
    <Modal
      width="500px"
      title="修改会话标题"
      open={true}
      styles={{
        body: {
          paddingTop: 20,
        },
      }}
      onCancel={() => onClose(false)}
      onOk={form.submit}
    >
      <Form
        form={form}
        name="basic"
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item<FieldType> label="会话标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="请输入标题" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
