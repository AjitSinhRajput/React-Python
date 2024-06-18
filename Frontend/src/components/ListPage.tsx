import React, { useEffect, useState } from "react";
import AddList from "./AddList";
import { Table } from "antd";
import { toast } from "react-toastify";
import useApi from "../redux/hooks/useApi";

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

  const onSuccessDelete = async (response: any) => {
    toast.success(response?.data[0]?.message);
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
      render: (text: any, record: any, index: number) => index + 1,
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
      render: (status: string) => {
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
          <span className={`badge p-2 ${clname}`}>
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
      render: (text: any, record: any) => {
        // console.log(record.id); // Print the record to the console for debugging
        return (
          <div className="d-flex gap-2">
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
    setDataSource(response?.data?.lists);
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

  return (
    <div className="mt-2 ">
      <div className="d-flex align-items-center mb-4 w-100">
        <div>
          <h1>Listing Page</h1>
        </div>
        <div className="ms-auto">
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
    </div>
  );
};

export default ListPage;
