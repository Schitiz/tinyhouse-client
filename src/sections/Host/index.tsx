import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import {
  Layout,
  Typography,
  Form,
  Input,
  InputNumber,
  Radio,
  Upload,
  Button,
} from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import {
  BankFilled,
  HomeFilled,
  PlusSquareFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { Viewer } from '../../lib/types';
import { HOST_LISTING } from '../../lib/graphql/mutations';
import {
  HostListing as HostListingData,
  HostListingVariables,
} from '../../lib/graphql/mutations/HostListing/__generated__/HostListing';
import { Link, Redirect } from 'react-router-dom';
import { ListingType } from '../../lib/graphql/globalTypes';
import {
  iconColor,
  displayErrorMessage,
  displaySuccessNotification,
} from '../../lib/utils';

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;
const { Title, Text } = Typography;
const { Item } = Form;

export const Host = ({ viewer }: Props) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);

  const [hostListing, { loading, data }] = useMutation<
    HostListingData,
    HostListingVariables
  >(HOST_LISTING, {
    onCompleted: () => {
      displaySuccessNotification("You've successfully created your listing");
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! We weren't able to create your listing. Please try again later."
      );
    },
  });

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;

    if (file.status === 'uploading') {
      setImageLoading(true);
      return;
    }

    if (file.status === 'done' && file.originFileObj) {
      getBase64Value(file.originFileObj, (imageBase64Value) => {
        setImageBase64Value(imageBase64Value);
        setImageLoading(false);
      });
    }
  };

  const handleHostListing = (values: any) => {
    console.log(values);
    const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;

    const input = {
      ...values,
      address: fullAddress,
      image: imageBase64Value,
      price: values.price * 100,
    };

    delete input.city;
    delete input.state;
    delete input.postalCode;

    hostListing({
      variables: {
        input,
      },
    });
    console.log(values);
  };

  if (!viewer || !viewer.id) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            You'll have to be signed in and connected with Stripe to host a
            listing!
          </Title>
          <Text type="secondary">
            We only allow users who've signed in to out application and have
            connected with Stripe to host new listings. You can sign in at the{' '}
            <Link to="/login">/login</Link> page and connect with Stripe shortly
            after
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Please wait!
          </Title>
          <Text type="secondary">We're creating your listing now.</Text>
        </div>
      </Content>
    );
  }

  if (data && data.hostListing) {
    return <Redirect to={`/listing/${data.hostListing.id}`} />;
  }

  return (
    <Content className="host-content">
      <Form
        layout="vertical"
        onFinish={handleHostListing}
        onFinishFailed={(errorFields) => {
          displayErrorMessage('Please complete all required form fields.');
        }}
      >
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we'll collect some basic and additional information
            about your listing.
          </Text>
        </div>

        <Item
          name="type"
          rules={[
            {
              required: true,
              message: 'Please select a home type!',
            },
          ]}
          label="Home Type"
        >
          <Radio.Group>
            <Radio.Button value={ListingType.APARTMENT}>
              <BankFilled style={{ color: iconColor }} />
              <span> Apartment</span>
            </Radio.Button>
            <Radio.Button value={ListingType.HOUSE}>
              <HomeFilled style={{ color: iconColor }} />
              <span> House</span>
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item
          name="numOfGuests"
          rules={[
            {
              required: true,
              message: 'Please enter a max number of guests!',
            },
          ]}
          label="Max # of Guests"
        >
          <InputNumber min={1} placeholder="4" />
        </Item>

        <Item
          name="title"
          rules={[
            {
              required: true,
              message: 'Please enter a title for your listing!',
            },
          ]}
          label="Title"
          extra="Max character count of 45"
        >
          <Input
            maxLength={45}
            placeholder="The iconic and luxurious Bel-Air mansion"
          />
        </Item>

        <Item
          name="description"
          rules={[
            {
              required: true,
              message: 'Please enter a description for your listing!',
            },
          ]}
          label="Description of listing"
          extra="Max character count of 400"
        >
          <Input.TextArea
            rows={3}
            maxLength={400}
            placeholder="Modern, clean and iconic home of the Fresh Prince. Situated in the heart of Bel-Air Los Angeles."
          />
        </Item>

        <Item
          name="address"
          rules={[
            {
              required: true,
              message: 'Please address for your listing!',
            },
          ]}
          label="Address"
        >
          <Input placeholder="251 North Bristol Avenue" />
        </Item>

        <Item
          name="city"
          rules={[
            {
              required: true,
              message: 'Please enter a city (or region) for your listing!',
            },
          ]}
          label="City/Town"
        >
          <Input placeholder="Los Angeles" />
        </Item>

        <Item
          name="state"
          rules={[
            {
              required: true,
              message: 'Please enter a state (or province) for your listing!',
            },
          ]}
          label="State/Province"
        >
          <Input placeholder="California" />
        </Item>

        <Item
          name="postalCode"
          rules={[
            {
              required: true,
              message: 'Please enter a zip (or postal) code for your listing!',
            },
          ]}
          label="Zip/Postal Code"
        >
          <Input placeholder="Please enter a zip code for your listing." />
        </Item>

        <Item
          name="image"
          rules={[
            {
              required: true,
              message: 'Please provide an image for your listing!',
            },
          ]}
          label="Image"
          extra="Images have to be under 1MB of size and of type JPG or PNG"
        >
          <div className="host__form-image-upload">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
            >
              {imageBase64Value ? (
                <img src={imageBase64Value} alt="listing" />
              ) : (
                <div>
                  {imageLoading ? <LoadingOutlined /> : <PlusSquareFilled />}
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </Item>

        <Item
          name="price"
          rules={[
            {
              required: true,
              message: 'Please enter a price for your listing!',
            },
          ]}
          label="Price"
          extra="All prices in $USD/day"
        >
          <InputNumber min={0} placeholder="120" />
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};

const beforeImageUpload = (file: File) => {
  const fileIsValidImage =
    file.type === 'image/jpeg' || file.type === 'image/png';
  const fileIsValidSize = file.size / 1024 / 1024 < 1;

  if (!fileIsValidImage) {
    displayErrorMessage("You're only able to upload valid JPG or PNG files!");
    return false;
  }

  if (!fileIsValidSize) {
    displayErrorMessage(
      "You're only able to upload valid image files of under 1MB in size!"
    );
    return false;
  }

  return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (
  img: File | Blob,
  callback: (imageBase64Value: string) => void
) => {
  const reader = new FileReader();
  reader.readAsDataURL(img);
  reader.onload = () => {
    callback(reader.result as string);
  };
};
