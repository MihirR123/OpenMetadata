/*
 *  Copyright 2023 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ENTITY_PERMISSIONS } from 'mocks/Permissions.mock';
import React from 'react';
import { DEFAULT_ENTITY_PERMISSION } from 'utils/PermissionsUtils';
import { topicVersionMockProps } from '../../mocks/TopicVersion.mock';
import TopicVersion from './TopicVersion.component';

const mockPush = jest.fn();

jest.mock(
  'components/DataAssets/DataAssetsVersionHeader/DataAssetsVersionHeader',
  () => jest.fn().mockImplementation(() => <div>DataAssetsVersionHeader</div>)
);

jest.mock('components/TabsLabel/TabsLabel.component', () =>
  jest.fn().mockImplementation(({ name }) => <div>{name}</div>)
);

jest.mock('components/Tag/TagsContainerV2/TagsContainerV2', () =>
  jest.fn().mockImplementation(() => <div>TagsContainerV2</div>)
);

jest.mock('components/common/CustomPropertyTable/CustomPropertyTable', () => ({
  CustomPropertyTable: jest
    .fn()
    .mockImplementation(() => <div>CustomPropertyTable</div>),
}));

jest.mock('components/common/description/DescriptionV1', () =>
  jest.fn().mockImplementation(() => <div>DescriptionV1</div>)
);

jest.mock('components/common/error-with-placeholder/ErrorPlaceHolder', () =>
  jest.fn().mockImplementation(() => <div>ErrorPlaceHolder</div>)
);

jest.mock('components/Entity/EntityVersionTimeLine/EntityVersionTimeLine', () =>
  jest.fn().mockImplementation(() => <div>EntityVersionTimeLine</div>)
);

jest.mock('components/TopicDetails/TopicSchema/TopicSchema', () =>
  jest.fn().mockImplementation(() => <div>TopicSchema</div>)
);

jest.mock('components/Loader/Loader', () =>
  jest.fn().mockImplementation(() => <div>Loader</div>)
);

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn().mockImplementation(() => ({
    push: mockPush,
  })),
  useParams: jest.fn().mockReturnValue({
    tab: 'topics',
  }),
}));

describe('TopicVersion tests', () => {
  it('Should render component properly if not loading', async () => {
    await act(async () => {
      render(<TopicVersion {...topicVersionMockProps} />);
    });

    const dataAssetsVersionHeader = screen.getByText('DataAssetsVersionHeader');
    const description = screen.getByText('DescriptionV1');
    const schemaTabLabel = screen.getByText('label.schema');
    const customPropertyTabLabel = screen.getByText(
      'label.custom-property-plural'
    );
    const entityVersionTimeLine = screen.getByText('EntityVersionTimeLine');
    const topicSchema = screen.getByText('TopicSchema');

    expect(dataAssetsVersionHeader).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(schemaTabLabel).toBeInTheDocument();
    expect(customPropertyTabLabel).toBeInTheDocument();
    expect(entityVersionTimeLine).toBeInTheDocument();
    expect(topicSchema).toBeInTheDocument();
  });

  it('Should display Loader if isVersionLoading is true', async () => {
    await act(async () => {
      render(<TopicVersion {...topicVersionMockProps} isVersionLoading />);
    });

    const loader = screen.getByText('Loader');
    const entityVersionTimeLine = screen.getByText('EntityVersionTimeLine');
    const dataAssetsVersionHeader = screen.queryByText(
      'DataAssetsVersionHeader'
    );
    const schemaTabLabel = screen.queryByText('label.schema');
    const customPropertyTabLabel = screen.queryByText(
      'label.custom-property-plural'
    );
    const topicSchema = screen.queryByText('TopicSchema');

    expect(loader).toBeInTheDocument();
    expect(entityVersionTimeLine).toBeInTheDocument();
    expect(dataAssetsVersionHeader).toBeNull();
    expect(schemaTabLabel).toBeNull();
    expect(customPropertyTabLabel).toBeNull();
    expect(topicSchema).toBeNull();
  });

  it('Should display ErrorPlaceholder if no viewing permission', async () => {
    await act(async () => {
      render(
        <TopicVersion
          {...topicVersionMockProps}
          entityPermissions={DEFAULT_ENTITY_PERMISSION}
        />
      );
    });

    const errorPlaceHolder = screen.getByText('ErrorPlaceHolder');
    const loader = screen.queryByText('Loader');
    const dataAssetsVersionHeader = screen.queryByText(
      'DataAssetsVersionHeader'
    );
    const schemaTabLabel = screen.queryByText('label.schema');
    const customPropertyTabLabel = screen.queryByText(
      'label.custom-property-plural'
    );
    const entityVersionTimeLine = screen.queryByText('EntityVersionTimeLine');
    const topicSchema = screen.queryByText('TopicSchema');

    expect(errorPlaceHolder).toBeInTheDocument();
    expect(loader).toBeNull();
    expect(entityVersionTimeLine).toBeNull();
    expect(dataAssetsVersionHeader).toBeNull();
    expect(schemaTabLabel).toBeNull();
    expect(customPropertyTabLabel).toBeNull();
    expect(topicSchema).toBeNull();
  });

  it('Should display ErrorPlaceholder in Custom Property tab if no "viewAll" permission', async () => {
    await act(async () => {
      render(
        <TopicVersion
          {...topicVersionMockProps}
          entityPermissions={{ ...DEFAULT_ENTITY_PERMISSION, ViewBasic: true }}
        />
      );
    });

    const customPropertyTabLabel = screen.getByText(
      'label.custom-property-plural'
    );
    const topicSchema = screen.getByText('TopicSchema');
    let errorPlaceHolder = screen.queryByText('ErrorPlaceHolder');

    expect(customPropertyTabLabel).toBeInTheDocument();
    expect(topicSchema).toBeInTheDocument();
    expect(errorPlaceHolder).toBeNull();

    await act(async () => {
      userEvent.click(customPropertyTabLabel);
    });

    errorPlaceHolder = screen.getByText('ErrorPlaceHolder');

    expect(errorPlaceHolder).toBeInTheDocument();
  });

  it('Should update url on click of tab', async () => {
    await act(async () => {
      render(
        <TopicVersion
          {...topicVersionMockProps}
          entityPermissions={ENTITY_PERMISSIONS}
        />
      );
    });

    const customPropertyTabLabel = screen.getByText(
      'label.custom-property-plural'
    );

    expect(customPropertyTabLabel).toBeInTheDocument();

    await act(async () => {
      userEvent.click(customPropertyTabLabel);
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/topic/sample_kafka.sales/versions/0.3/custom_properties'
    );
  });

  it('ErrorPlaceholder should be displayed in case of no view permissions', async () => {
    await act(async () => {
      render(
        <TopicVersion
          {...topicVersionMockProps}
          entityPermissions={DEFAULT_ENTITY_PERMISSION}
        />
      );
    });

    const topicSchema = screen.queryByText('TopicSchema');

    const description = screen.queryByText('Description.component');

    const entityVersionTimeLine = screen.queryByText(
      'EntityVersionTimeLine.component'
    );
    const errorPlaceHolder = screen.getByText('ErrorPlaceHolder');

    expect(entityVersionTimeLine).toBeNull();
    expect(topicSchema).toBeNull();
    expect(description).toBeNull();
    expect(errorPlaceHolder).toBeInTheDocument();
  });
});
