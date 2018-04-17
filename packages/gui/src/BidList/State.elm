module BidList.State exposing
    ( init
    , update
    , subscriptions
    )

import Platform.Cmd

import Ports
import Bid.Types exposing
    ( Value
    , Bid
    )

import BidList.Types exposing (..)
import BidList.Rest exposing (getBids)
import BidList.Table.Types as TableTypes
import BidList.Filter.Types as FilterTypes
import BidList.Filter.Part.Types as FilterPartTypes

import BidList.Table.State as TableState
import BidList.Filter.State as FilterState
import Error.State as ErrorState

import Utils.State exposing (foldMsg)
import Utils.List exposing (nub)


init : String -> (Model, Cmd Msg)
init bidPath =
    let
        (tableModel, tableCmd) = TableState.init
        (filterModel, filterCmd) = FilterState.init
        (errorModel, errorCmd) = ErrorState.init
    in
        (   { table = tableModel
            , filter = filterModel
            , error = errorModel
            , bidPath = bidPath
            }
        , Cmd.batch
            [ Platform.Cmd.map mapTableCmd tableCmd
            , Platform.Cmd.map Filter filterCmd
            , Platform.Cmd.map Error errorCmd
            , getBids bidPath
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Filter subMsg ->
            let
                (subModel, subCmd) = FilterState.update subMsg (.filter model)
            in
                ({model | filter = subModel}, Platform.Cmd.map Filter subCmd)

        ToTable subMsg ->
            let
                (subModel, subCmd) = TableState.update subMsg (.table model)
            in
                ({model | table = subModel}, Platform.Cmd.map mapTableCmd subCmd)

        Error subMsg ->
            let
                (subModel, subCmd) = ErrorState.update subMsg (.error model)
            in
                ({model | error = subModel}, Platform.Cmd.map Error subCmd)

        SetBids bids ->
            foldMsg update model
                [ ToTable <| TableTypes.SetBids bids
                , Filter
                    <| FilterTypes.From
                    <| FilterPartTypes.SetCurrencies
                    <| filterElementsPart .from bids
                , Filter
                    <| FilterTypes.To
                    <| FilterPartTypes.SetCurrencies
                    <| filterElementsPart .to bids
                ]

        UpdateBids ->
            (model, getBids model.bidPath)

        BidClick _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map Filter <| FilterState.subscriptions model.filter
        , Sub.map ToTable <| TableState.subscriptions model.table
        , Sub.map Error <| ErrorState.subscriptions model.error
        , Ports.updateBids <| (\_ -> UpdateBids)
        ]


filterElementsPart : (Bid -> Value) -> List Bid -> List String
filterElementsPart access =
    nub << List.map (.currency << access)
