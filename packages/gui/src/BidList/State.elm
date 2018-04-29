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

import BidList.Table.State as TableState
import BidList.Filter.State as FilterState
import Error.State as ErrorState

import Utils.State exposing (foldMsg)
import Utils.List exposing (nub)


init : Bool -> String -> (Model, Cmd Msg)
init showStatus bidPath =
    let
        (tableModel, tableCmd) = TableState.init showStatus
        (filterModel, filterCmd) = FilterState.init bidPath
        (errorModel, errorCmd) = ErrorState.init
    in
        (   { table = tableModel
            , filter = filterModel
            , error = errorModel
            , bidPath = bidPath
            , initialized = False
            , loading = True
            }
        , Cmd.batch
            [ Platform.Cmd.map mapTableCmd tableCmd
            , Platform.Cmd.map ToFilter filterCmd
            , Platform.Cmd.map ToError errorCmd
            , getBids bidPath
            ]
        )

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToFilter subMsg ->
            let
                (subModel, subCmd) = FilterState.update subMsg (.filter model)
                newModel = {model
                    | filter = subModel
                    , table = Tuple.first <| TableState.update
                        (TableTypes.SetFilter <| FilterTypes.getFilter subModel)
                        model.table
                    }
            in
                ( newModel
                , Platform.Cmd.map ToFilter subCmd
                )

        ToTable subMsg ->
            let
                (subModel, subCmd) = TableState.update subMsg (.table model)
            in
                ({model | table = subModel}, Platform.Cmd.map mapTableCmd subCmd)

        ToError subMsg ->
            let
                (subModel, subCmd) = ErrorState.update subMsg (.error model)
                newModel = {model
                    | error = subModel
                    , initialized = True
                    , loading = False
                    }
            in
                (newModel, Platform.Cmd.map ToError subCmd)

        SetBids bids ->
            let
                newModel = {model
                    | initialized = True
                    , loading = False
                    }
            in
                foldMsg update newModel
                    [ ToTable
                        <| TableTypes.SetBids bids

                    , ToFilter
                        <| FilterTypes.SetCurrencies
                            (filterElementsPart .from bids)
                            (filterElementsPart .to bids)
                    ]

        UpdateBids ->
            let
                newModel = {model
                    | loading = True
                    }
            in
                (newModel, getBids model.bidPath)

        BidClick _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map ToFilter <| FilterState.subscriptions model.filter
        , Sub.map mapTableCmd <| TableState.subscriptions model.table
        , Sub.map ToError <| ErrorState.subscriptions model.error
        , Ports.updateBids <| (\_ -> UpdateBids)
        ]


filterElementsPart : (Bid -> Value) -> List Bid -> List String
filterElementsPart access =
    nub << List.map (.currency << access)
