module BidList.Table.View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Bid.Types exposing
    ( Bid
    )
import BidList.Filter.Types exposing
    ( Filter
    )
import BidList.Table.Types exposing (..)
import Bid.View exposing
    ( bidList
    )


root : Model -> Filter -> Html Msg
root model filter =
    let
        bids = filteredBids model filter
    in
        if List.isEmpty model.bids then
            error "There is no bids to display"

        else if List.isEmpty bids then
            error "Selected filter doesn't match any bids"

        else
            div []
                [ bidList model.showStatus Click bids
                , pagination 1 1
                , pagination 1 2
                , pagination 1 3
                , pagination 2 3
                , pagination 3 3
                , pagination 1 4
                , pagination 1 100
                , pagination 2 100
                , pagination 3 100
                , pagination 4 100
                , pagination 45 100
                , pagination 96 100
                , pagination 97 100
                , pagination 98 100
                , pagination 99 100
                , pagination 100 100
                ]


-- Error

error : String -> Html Msg
error message =
    article [class "message is-danger"]
        [ div [class "message-body"]
            [ p [] [text message]
            ]
        ]


-- Filter

filteredBids : Model -> Filter -> List Bid
filteredBids model filter =
    List.filter (filterBid filter) model.bids


filterBid : Filter -> Bid -> Bool
filterBid filter bid =
    List.member (.currency <| .from bid) (.from filter) &&
    List.member (.currency <| .to bid) (.to filter)


-- Pagination

ariaLabel : String -> Html.Attribute Msg
ariaLabel = attribute "aria-label"


role : String -> Html.Attribute Msg
role = attribute "role"


pagination : Int -> Int -> Html Msg
pagination current last =
    nav
        [ class "pagination is-centered"
        , role "navigation"
        , ariaLabel "pagination"
        ]
        [ paginationDirectionLink
            "pagination-previous"
            "Previous page"
            <| current == 1

        , paginationDirectionLink
            "pagination-next"
            "Next page"
            <| current == last

        , ul [class "pagination-list"]
            [ paginationList current last
            ]
        ]


paginationDirectionLink : String -> String -> Bool -> Html Msg
paginationDirectionLink className title isDisabled =
    let
        attributes =
            [ class className
            ]
            ++ (itemIf isDisabled <| attribute "disabled" "")
    in
        a
            attributes
            [ text title
            ]


paginationList : Int -> Int -> Html Msg
paginationList current last =
    let
        toEntry maybePage =
            case maybePage of
                Just page ->
                    paginationLink page <| page == current

                Nothing ->
                    paginationEllipsis
    in
        li []
            <| List.map toEntry
            <| paginationEntries current last


paginationLink : Int -> Bool -> Html Msg
paginationLink page isCurrent =
    let
        extraClass =
            if isCurrent then
                " is-current"
            else
                ""
    in
        a
            [ class <| "pagination-link" ++ extraClass
            , ariaLabel <| "Go to page " ++ toString page
            ]
            [ text <| toString page
            ]

paginationEllipsis : Html Msg
paginationEllipsis =
    span [class "pagination-ellipsis"]
        [text "\x2026"
        ]


paginationEntries : Int -> Int -> List (Maybe Int)
paginationEntries current last =
    List.concat
        -- First entry
        [ itemIf True
            <| Just 1

        -- First ellipsis
        , itemIf (current >= 4)
            <| Nothing

        -- Page before
        , itemIf (current >= 3)
            <| Just <| current - 1

        -- Current page
        , itemIf (current >= 2 && current <= last - 1)
            <| Just current

        -- Page after
        , itemIf (current <= last - 2)
            <| Just <| current + 1

        -- Second ellipsis
        , itemIf (current <= last - 3)
            <| Nothing

        -- Last entry
        , itemIf (last > 1)
            <| Just last
        ]


itemIf : Bool -> a -> List a
itemIf condition value =
    if condition then
        [value]
    else
        []
