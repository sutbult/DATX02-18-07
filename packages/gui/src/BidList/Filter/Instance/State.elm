module BidList.Filter.Instance.State exposing
    ( init
    , update
    , subscriptions
    )

import Platform.Cmd
import BidList.Filter.Instance.Types exposing (..)

import BidList.Filter.Part.Types as PartTypes
import BidList.Filter.Part.State as PartState
import Utils.State exposing
    ( foldMsg
    )

init : (Model, Cmd Msg)
init =
    let
        (fromModel, fromCmd) = PartState.init "From"
        (toModel, toCmd) = PartState.init "To"
    in
        ( { from = fromModel, to = toModel}
        , Cmd.batch
            [ Platform.Cmd.map From fromCmd
            , Platform.Cmd.map To toCmd
            ]
        )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        From subMsg ->
            let
                (nmodel, ncmd) = PartState.update subMsg (.from model)
            in
                ({model | from = nmodel}, Platform.Cmd.map From ncmd)

        To subMsg ->
            let
                (nmodel, ncmd) = PartState.update subMsg (.to model)
            in
                ({model | to = nmodel}, Platform.Cmd.map To ncmd)

        SetCurrencies from to ->
            foldMsg update model
                [ From <| PartTypes.SetCurrencies from
                , To <| PartTypes.SetCurrencies to
                ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map From <| PartState.subscriptions model.from
        , Sub.map To <| PartState.subscriptions model.to
        ]
