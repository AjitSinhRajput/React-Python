import React, { useEffect, useState } from "react";
import AddList from "./AddList";
import { Divider, Dropdown, Menu, Modal, Spin, Table } from "antd";
import { toast } from "react-toastify";
import useApi from "../redux/hooks/useApi";
import { DownOutlined } from "@ant-design/icons";

interface Pagination {
  current: number;
  pageSize: number;
  total?: number; // Make total optional initially
}

const ListPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const onSuccessDelete = async (response: any) => {
    toast.success(response?.data?.message);
    callFetchLists(
      "get",
      `get-all-lists?page=${pagination.current}&page_size=${pagination.pageSize}`
    );
  };

  const onFailureDelete = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingDelete, callFetch: callFetchDelete } = useApi({
    onSuccess: onSuccessDelete,
    onFailure: onFailureDelete,
    header: "application/json",
  });
  useEffect(() => {
    // Fetch initial data when component mounts
    callFetchLists(
      "get",
      `get-all-lists?page=${pagination.current}&page_size=${pagination.pageSize}`
    );
  }, [pagination.current, pagination.pageSize]);

  const handleAddList = () => {
    callFetchLists(
      "get",
      `get-all-lists?page=${pagination.current}&page_size=${pagination.pageSize}`
    );
  };

  const handleEdit = (id: any) => {
    console.log("Edit ID:", id);
  };

  const columns = [
    {
      title: "Index",
      dataIndex: "index",
      key: "index",
      render: (text: any, record: any, index: number) => {
        // Calculate the index based on the sorted order of the data by 'id'
        return dataSource.findIndex((item: any) => item.id === record.id) + 1;
      },
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => {
        let clname = "";
        switch (status) {
          case "active":
            clname = "text-bg-success";
            break;
          case "inactive":
            clname = "text-bg-danger";
            break;
          case "pending":
            clname = "text-bg-warning";
            break;
          default:
            clname = "text-bg-dark";
            break;
        }
        return (
          <span className={`badge p-2 ${clname}`} key={record?.id}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (index: any, record: any) => {
        // console.log(record.id); // Print the record to the console for debugging
        return (
          <div className="d-flex gap-2" key={index}>
            <AddList onAdd={handleAddList} list_id={record?.id} />
            <button
              className="btn btn-outline-danger btn-sm"
              disabled={isloadingDelete}
              onClick={() =>
                callFetchDelete("delete", `delete-list?list_id=${record?.id}`)
              }
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const onSuccessLists = async (response: any) => {
    toast.success(response?.data[0]?.message);
    // setDataSource(response?.data?.lists);
    const sortedData = response?.data?.lists.sort(
      (a: any, b: any) => a.id - b.id
    );
    setDataSource(sortedData);
    setPagination({
      ...pagination,
      total: response?.data?.total_count,
    });
  };

  const onFailureLists = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingLists, callFetch: callFetchLists } = useApi({
    onSuccess: onSuccessLists,
    onFailure: onFailureLists,
    header: "application/json",
  });

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const onSuccessExport = async (response: any) => {
    // Assume the response contains a file URL
    // console.log(response);
    const fileURL = response?.data?.file_path;
    setDownloadLink(fileURL);
    setIsModalVisible(true);
  };

  const onFailureExport = (error: any) => {
    toast.error(error.response.data.detail);
  };

  const { isloading: isloadingExport, callFetch: callFetchExport } = useApi({
    onSuccess: onSuccessExport,
    onFailure: onFailureExport,
    header: "application/json",
  });
  const handleExport = (type: string) => {
    callFetchExport("get", `export-all-lists?format=${type}`);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" onClick={() => handleExport("csv")}>
        Export as CSV
      </Menu.Item>
      <Menu.Item key="excel" onClick={() => handleExport("excel")}>
        Export as Excel
      </Menu.Item>
    </Menu>
  );
  return (
    <div className="">
      {isloadingExport ? <Spin fullscreen size="large" /> : ""}
      <div className="d-flex row align-items-center mb-4 w-100">
        <div className="col-lg-8 col-md-7">
          <h1>Listing Page</h1>
        </div>
        <div className="ms-auto d-flex gap-3 col-md-5 col-lg-4">
          <Dropdown overlay={exportMenu}>
            <button type="button" className="btn btn-primary">
              Export <DownOutlined />
            </button>
          </Dropdown>
          <AddList onAdd={handleAddList} />
        </div>
      </div>
      <Table
        style={{
          backgroundColor: "#D8DCE0",
          // width: "100%",
          borderRadius: "8px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
        bordered
        scroll={{ x: "true" }}
        size="small"
        className="p-2"
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={{ ...pagination, position: ["bottomCenter"] }}
        loading={isloadingLists}
        onChange={handleTableChange}
      />
      <Modal
        title="Download Exported File"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        maskClosable={false}
        footer={
          isloadingExport ? (
            ""
          ) : (
            <div className="d-flex gap-3 align-items-center justify-content-center">
              <button
                type="button"
                className="btn btn-outline-primary fw-bold"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary fw-bold"
                onClick={handleOk}
              >
                <a href={downloadLink} download>
                  <span className="text-white"> Download</span>
                </a>
              </button>
            </div>
          )
        }
      >
        {isloadingExport ? (
          ""
        ) : (
          <p>
            Your export is ready. You can save the file by clicking on Download
            button.
          </p>
        )}

        {/* <a href={downloadLink} download>
          Download Excel File
        </a> */}
      </Modal>
    </div>
  );
};

export default ListPage;
