import React, { useEffect } from "react";
import { usePageTranslation } from "../../hooks/usePageTranslation";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  IConfigDisplayField,
  IConfigCustomAction,
  ICustomLabels,
} from "../../common/models/config.model";
import { dataHelpers } from "../../helpers/data.helpers";
import { Button } from "../button/button.comp";
import { InfiniteLoader } from "../infiniteLoader/infiniteLoader.comp";
import { IPaginationState } from "../../common/models/states.model";
import { Pagination } from "../pagination/pagination.comp";
import { IAppContext } from "../app.context";
import { withAppContext } from "../withContext/withContext.comp";

import "./table.scss";

interface IProps {
  context: IAppContext;
  items: any[];
  pagination?: IPaginationState;
  callbacks: {
    delete: ((item: any) => void) | null;
    put: ((item: any) => void) | null;
    action: (item: any, action: IConfigCustomAction) => void;
    setQueryParam: (name: string, value: any) => void;
    getPreviousPage: (() => void) | null;
    getNextPage: (() => void) | null;
  };
  fields: IConfigDisplayField[];
  customActions?: IConfigCustomAction[];
  customLabels?: ICustomLabels;
}

export const Table = withAppContext(({ context, items, fields, pagination, callbacks, customActions, customLabels }: IProps) => {
  const { translatePage } = usePageTranslation(context.activePage?.id);
  const editLabel = customLabels?.buttons?.editItem || translatePage('buttons.editItem');
  const deleteLabel = customLabels?.buttons?.deleteItem || translatePage('buttons.deleteItem');
  const actionColumnHeader =
    customLabels?.tableColumnHeaders?.actions || translatePage('common.actions');
  const paginationCallbacks = {
    nextPage:
      callbacks.getNextPage ||
      (() => {
        return;
      }),
    previousPage:
      callbacks.getPreviousPage ||
      (() => {
        return;
      }),
  };

    function renderTableCell(
      origField: IConfigDisplayField,
      origItem: any,
      value: any
    ) {
      if (origField.type === "boolean") {
        value = value ? true : false;
      }

      if (value && typeof value === "object") {
        return value.toString();
      }

      // Try to get translated value for text fields
      const translatedValue = origField.name ? translatePage(`fields.${origField.name}.values.${value}`, { returnNull: true }) : null;
      
      switch (origField.type) {
        case "text":
          return <span>{translatedValue || value}</span>;
      case "boolean":
        return <div className={`bool ${value ? "true" : "false"}`}></div>;
      case "image":
        return (
          <img
            src={value || ""}
            alt={value || origField.label || origField.name}
          />
        );
      case "url":
        let url: string = origField.url || value || "";

        // Replace all url vars
        fields.forEach((field) => {
          const fieldValue = dataHelpers.extractDataByDataPath(
            origItem,
            field.dataPath,
            field.name
          );
          url = url.replace(`:${field.name}`, fieldValue);
        });

        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {origField.urlLabel || value}
          </a>
        );
      case "colorbox":
        return (
          <div className="colorbox" style={{ backgroundColor: value }}></div>
        );
      case "html":
        const htmlCode = origField.htmlCode || "<span>{value}</span>";
        const html = htmlCode.replace("{value}", value);
        return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
      default:
        return value;
    }
  }

  function renderTableRow(item: any, rowIdx: number) {
    return (
      <tr key={`tr_${rowIdx}`}>
        {fields.map((field, fieldIdx) => {
          const value = dataHelpers.extractDataByDataPath(
            item,
            field.dataPath,
            field.name
          );
          return (
            <td
              className={`${field.truncate ? "truncate" : ""} td-${field.name}`}
              key={`td_${rowIdx}_${fieldIdx}`}
            >
              {renderTableCell(field, item, value)}
            </td>
          );
        })}
        <td>
          <div className="actions-wrapper">
            {callbacks.put && (
              <Button onClick={() => callbacks.put?.(item)} title={editLabel}>
                <i className={`fa fa-${context.activePage?.methods?.put?.icon || 'pencil-square-o'}`} aria-hidden="true" />
              </Button>
            )}
            {customActions &&
              customActions.length > 0 &&
              customActions.map((action, idx) => (
                <Button
                  key={`action_${rowIdx}_${idx}`}
                  onClick={() => callbacks.action(item, action)}
                  title={action.name}
                >
                  <i
                    className={`fa fa-${action.icon || "cogs"}`}
                    aria-hidden="true"
                  ></i>
                </Button>
              ))}
            {callbacks.delete && (
              <Button
                onClick={() => callbacks.delete?.(item)}
                title={deleteLabel}
              >
                <i className={`fa fa-${context.activePage?.methods?.delete?.icon || 'times'}`} aria-hidden="true"></i>
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  function renderTableContent() {
    return (
      <table className="pure-table">
        <thead>
          <tr>
            {fields.map((field) => {
              return (
                <th
                  key={`th_${field.name}`}
                  className={`th-${field.name}`}
                  onClick={() => {
                    if (field.queryShortcut) {
                      callbacks.setQueryParam(
                        field.queryShortcut.name,
                        field.queryShortcut.value ||
                        `${field.dataPath ? field.dataPath + "." : ""}${field.name}`
                      );
                    }
                  }}
                >
                  <div className="th-content">
                    <span>{field.label || translatePage(`fields.${field.name}.label`) || field.name}</span>
                    {translatePage(`fields.${field.name}.helpText`, { returnNull: true }) && (

                      <i
                        className="fa fa-question-circle help-icon"
                        aria-hidden="true"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <span className="help-text">
                          {translatePage(`fields.${field.name}.helpText`)}
                        </span>
                      </i>
                    )}
                  </div>
                </th>
              );
            })}
            <th>{actionColumnHeader}</th>
          </tr>
        </thead>
        <tbody>{items.map(renderTableRow)}</tbody>
      </table>
    );
  }

  useEffect(() => {
    if (
      pagination?.type === "infinite-scroll" &&
      document.body.clientHeight <= window.innerHeight &&
      pagination?.hasNextPage
    ) {
      paginationCallbacks.nextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pagination?.type === "infinite-scroll") {
    return (
      <InfiniteScroll
        dataLength={items.length}
        next={callbacks.getNextPage || (() => null)}
        hasMore={pagination?.hasNextPage || false}
        loader={<InfiniteLoader />}
      >
        {renderTableContent()}
      </InfiniteScroll>
    );
  }

  return (
    <div className="table-wrapper">
      {renderTableContent()}
      {pagination && pagination.type === "buttons" && (
        <Pagination
          callbacks={paginationCallbacks}
          pagination={pagination}
          customLabels={customLabels}
        ></Pagination>
      )}
    </div>
  );
});
